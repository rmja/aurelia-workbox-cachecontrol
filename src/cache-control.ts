import { AffiliationEntry, CacheContext, ExpirationEntry, TagEntry } from "./cache-context";
import { DateTime, Duration } from "luxon";
import { LogManager, autoinject } from "aurelia-framework";

import { CacheOptions } from './cache-options';
import { Logger } from "aurelia-logging";

export interface ICacheControlBuilder {
    bePrivate(): ICacheControlBuilder;
    haveTags(...tags: string[]): ICacheControlBuilder;
    commit(): Promise<void>;
}

@autoinject()
export class CacheControl {
    private runtimeCacheOpenPromise: Promise<Cache>;
    private runtimeCache?: Cache;
    private logger: Logger;
    public currentPrincipalId?: string;
    private initializedPromise: Promise<void>;
    private deleteExpiredTimerHandle!: number;
    private nextExpiration = NoExpiration;

    constructor(private db: CacheContext, options: CacheOptions) {
        this.logger = LogManager.getLogger("cache-control");

        options.ensureValid();

        this.deleteExpiredTick = this.deleteExpiredTick.bind(this);
        this.initializedPromise = this.deleteExpiredTick();
        this.runtimeCacheOpenPromise = caches.open(options.runtimeCacheName);
    }

    let(urlOrObjectWithUrl: string | { url: string }) {
        const url = typeof urlOrObjectWithUrl === "string" ? urlOrObjectWithUrl : urlOrObjectWithUrl.url;
        return new CacheControlBuilder(url, this.db, this.logger, this.currentPrincipalId, this.trySetExpiration.bind(this));
    }

    async ensurePrincipal(principalId: string) {
        if (!principalId) {
            throw new Error("No principal id is specified, use clearPrivate() if all private entries should be deleted");
        }

        this.logger.debug(`Ensuring that private entries in cache belongs to '${principalId}'`)

        this.currentPrincipalId = principalId;

        let urls!: string[];
        await this.initializedPromise;
        await this.db.transaction("rw", this.db.affiliations, async () => {
            const entries = await this.db.affiliations.where(nameof<AffiliationEntry>(x => x.principalId)).notEqual(principalId).toArray();
            urls = entries.map(x => x.url);
            await this.db.affiliations.bulkDelete(entries.map(x => x.url));
        });

        await this.delete(urls);

        this.logger.debug(`Removed ${urls.length} private entries`);
    }

    async clearPrivate() {
        let urls!: string[];

        this.logger.debug("Deleting all private entries");

        await this.initializedPromise;
        await this.db.transaction("rw", this.db.affiliations, async () => {
            const entries = await this.db.affiliations.toArray();
            await this.db.affiliations.bulkDelete(entries.map(x => x.url));
            urls = entries.map(x => x.url);
        });

        await this.delete(urls);
    }

    async bust(tags: string[]) {
        await this.initializedPromise;
        const tagEntries = await this.db.tags.where(nameof<TagEntry>(x => x.tag)).anyOf(tags).toArray();
        const urls = tagEntries.map(x => x.url);

        await this.delete(urls);

        this.logger.debug(`Busted ${urls.length} urls`, urls);
    }

    async refresh(url: string) {
        await this.initializedPromise;
        await this.db.transaction("rw", this.db.expirations, async () => {
            const expiration = await this.db.expirations.get(url);

            if (expiration && expiration.slidingExpiration) {
                expiration.nextExpiration = DateTime.local().plus(Duration.fromISO(expiration.slidingExpiration)).toJSDate();
                await this.db.expirations.update(url, expiration);
            }
        });
    }

    private async deleteExpiredTick() {
        this.logger.debug("Trying to delete any expired");

        await this.db.ensureValid();
        await this.deleteExpired();

        const nextExpirationEntry = await this.db.expirations.orderBy(nameof<ExpirationEntry>(x => x.nextExpiration)).first();

        if (nextExpirationEntry) {
            this.trySetExpiration(DateTime.fromJSDate(nextExpirationEntry.nextExpiration));
        }
        else {
            this.nextExpiration = NoExpiration;
        }
    }

    private async deleteExpired() {
        const now = new Date();
        let expiredUrls!: string[];

        await this.db.transaction("rw", this.db.expirations, async () => {
            const expirations = await this.db.expirations.where(nameof<ExpirationEntry>(x => x.nextExpiration)).belowOrEqual(now).toArray();
            expiredUrls = expirations.map(x => x.url);
            await this.db.expirations.bulkDelete(expiredUrls);
        });

        await this.delete(expiredUrls);

        this.logger.info(`Expired ${expiredUrls.length} urls`);
    }

    private trySetExpiration(expiration: DateTime) {
        if (!this.nextExpiration.isValid || expiration < this.nextExpiration) {
            if (this.deleteExpiredTimerHandle) {
                clearTimeout(this.deleteExpiredTimerHandle);
            }

            this.nextExpiration = expiration;
            const ttl = this.nextExpiration.diffNow();
            const ttlMs = Math.max(ttl.get("milliseconds"), 0) + 1; // Ensure fired after expiration
            this.deleteExpiredTimerHandle = window.setTimeout(this.deleteExpiredTick, ttlMs);

            this.logger.info(`Next expiration timer will be fired at ${this.nextExpiration.toString()}`, this.nextExpiration);
        }
    }

    private async delete(urls: string[]) {
        if (!this.runtimeCache) {
            const cache = await this.runtimeCacheOpenPromise;

            if (!this.runtimeCache) {
                this.runtimeCache = cache;
            }
        }

        // Delete cache entries
        const set = new Set(urls);
        const keys = await this.runtimeCache.keys();

        for (const key of keys) {
            if (set.has(key.url)) {
                await this.runtimeCache.delete(key);
            }
        }

        // Delete tags
        await this.db.transaction("rw", this.db.tags, async () => {
            const entries = await this.db.tags.where(nameof<TagEntry>(x => x.url)).anyOf(urls).toArray();
            await this.db.tags.bulkDelete(entries.map(x => x.key));
        });
    }
}

class CacheControlBuilder implements ICacheControlBuilder {
    private private = false;
    private tags: string[] = [];
    private absoluteExpiration?: DateTime;
    private absoluteExpirationRelativeToNow?: Duration;
    private slidingExpiration?: Duration;

    constructor(private url: string, private db: CacheContext, private logger: Logger, private currentPrincipalId: string | undefined, private trySetExpiration: (expiration: DateTime) => void) {
    }

    bePrivate() {
        this.private = true;
        return this;
    }

    haveTags(...tags: string[]) {
        this.tags.push(...tags);
        return this;
    }

    haveAbsoluteExpiration(expires: DateTime | Duration) {
        if (DateTime.isDateTime(expires)) {
            this.absoluteExpiration = expires;
        }
        else {
            this.absoluteExpirationRelativeToNow = expires;
        }
        return this;
    }

    haveSlidingExpiration(expires: Duration) {
        this.slidingExpiration = expires;
    }

    async commit() {
        await this.db.ensureValid();

        const promises: Promise<any>[] = [];
        if (this.private) {
            if (!this.currentPrincipalId) {
                throw new Error("No principal is currently configured. Use ensurePrincipal() before making anything private");
            }
            promises.push(this.db.affiliations.put({ url: this.url, principalId: this.currentPrincipalId}));
        }

        const entries = this.tags.map(tag => {
            return {
                key: createKey(this.url, tag),
                url: this.url,
                tag: tag,
            };
        });

        promises.push(this.db.tags.bulkPut(entries));

        let nextExpiration = NoExpiration;
        if (this.absoluteExpiration) {
            nextExpiration = this.absoluteExpiration;
        }
        else if (this.absoluteExpirationRelativeToNow) {
            nextExpiration = DateTime.local().plus(this.absoluteExpirationRelativeToNow);
        }
        else if (this.slidingExpiration) {
            nextExpiration = DateTime.local().plus(this.slidingExpiration);
        }

        if (nextExpiration.isValid) {
            promises.push(this.db.expirations.put({
                url: this.url,
                created: new Date(),
                nextExpiration: nextExpiration.toJSDate(),
                ... this.absoluteExpiration && { absoluteExpiration: this.absoluteExpiration.toJSDate() },
                ... this.slidingExpiration && { slidingExpiration: this.slidingExpiration.toISO() },
            }));
        }

        await Promise.all(promises);

        if (nextExpiration.isValid) {
            this.trySetExpiration(nextExpiration);
        }

        if (this.tags.length) {
            this.logger.debug(`Tagged ${this.url} with`, this.tags);
        }
    }
}

const NoExpiration = DateTime.invalid("No expiration");

const GS = String.fromCharCode(0x1D);

function createKey(url: string, tag: string) {
    return url + GS + tag;
}