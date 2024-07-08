import { AffiliationEntry, CacheContext, ExpirationEntry, TagEntry } from "./cache-context";
import { DateTime, Duration } from "luxon";
import { LogManager, autoinject } from "aurelia-framework";

import { CacheOptions } from './cache-options';
import { Logger } from "aurelia-logging";
import { nameOf } from "./nameof";

@autoinject()
export class CacheControl {
    /** @internal */
    public db: CacheContext;
    private runtimeCacheOpenPromise: Promise<Cache>;
    private runtimeCache?: Cache;
    /** @internal */
    public logger: Logger;
    public currentPrincipalId?: string;
    private initializingPromise?: Promise<void>;
    private deleteExpiredTimerHandle!: number;
    private nextExpiration: DateTime = NoExpiration;

    constructor(db: CacheContext, options: CacheOptions) {
        this.db = db;
        this.logger = LogManager.getLogger("cache-control");

        options.ensureValid();

        this.deleteExpiredTick = this.deleteExpiredTick.bind(this);
        this.runtimeCacheOpenPromise = caches.open(options.runtimeCacheName);
    }

    static create(configureAction: (options: CacheOptions) => void) {
        const options = new CacheOptions();
        configureAction(options);
        return new CacheControl(new CacheContext(options), options);
    }

    handle(urlOrResponse: string | { url: string, headers: Headers}) : CacheControlBuilder & Promise<void> {
        const url = typeof urlOrResponse === "string" ? urlOrResponse : urlOrResponse.url;
        const builder = new CacheControlBuilder(url, this);

        if (typeof urlOrResponse !== "string") {
            const cacheControlHeader = urlOrResponse.headers.get("Cache-Control");
            if (cacheControlHeader && cacheControlHeader.indexOf("private") >= 0) {
                // Make sure that the response is stored as private
                builder.isPrivate();
            }
        }

        return builder;
    }

    async ensurePrincipal(principalId: string) {
        if (!principalId) {
            throw new Error("No principal id is specified, use clearPrivate() if all private entries should be deleted");
        }

        this.logger.debug(`Ensuring that private entries in cache belongs to '${principalId}'`)

        this.currentPrincipalId = principalId;

        let urls!: string[];
        await this.ensureInitialized();
        await this.db.transaction("rw", this.db.affiliations, async () => {
            const entries = await this.db.affiliations.where(nameOf<AffiliationEntry>("principalId")).notEqual(principalId).toArray();
            urls = entries.map(x => x.url);
            await this.db.affiliations.bulkDelete(entries.map(x => x.url));
        });

        await this.delete(urls);

        this.logger.debug(`Removed ${urls.length} private entries`);
    }

    async clearPrivate() {
        let urls!: string[];

        this.logger.debug("Deleting all private entries");

        await this.ensureInitialized();
        await this.db.transaction("rw", this.db.affiliations, async () => {
            const entries = await this.db.affiliations.toArray();
            await this.db.affiliations.bulkDelete(entries.map(x => x.url));
            urls = entries.map(x => x.url);
        });

        await this.delete(urls);
    }

    async bustTags(...tags: string[]) {
        await this.ensureInitialized();
        const tagEntries = await this.db.tags.where(nameOf<TagEntry>("tag")).anyOf(tags).toArray();
        const urls = tagEntries.map(x => x.url);

        await this.delete(urls);

        this.logger.debug(`Busted ${urls.length} urls from ${tags.length} tags`, urls, tags);
    }

    async refresh(url: string) {
        await this.ensureInitialized();
        await this.db.transaction("rw", this.db.expirations, async () => {
            const expiration = await this.db.expirations.get(url);

            if (expiration && expiration.slidingExpiration) {
                expiration.nextExpiration = DateTime.local().plus(Duration.fromISO(expiration.slidingExpiration)).toJSDate();
                await this.db.expirations.update(url, expiration);
            }
        });
    }

    private async ensureInitialized() {
        if (!this.initializingPromise) {
            this.initializingPromise = this.deleteExpiredTick();
        }
        return this.initializingPromise;
    }

    private async deleteExpiredTick() {
        this.logger.debug("Trying to delete any expired");

        await this.db.ensureValid();
        await this.deleteExpired();

        const nextExpirationEntry = await this.db.expirations.orderBy(nameOf<ExpirationEntry>("nextExpiration")).first();

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
            const expirations = await this.db.expirations.where(nameOf<ExpirationEntry>("nextExpiration")).belowOrEqual(now).toArray();
            expiredUrls = expirations.map(x => x.url);
            await this.db.expirations.bulkDelete(expiredUrls);
        });

        await this.delete(expiredUrls);

        this.logger.info(`Expired ${expiredUrls.length} urls`);
    }

    /** @internal */
    public trySetExpiration(expiration: DateTime) {
        if (!this.nextExpiration.isValid || expiration < this.nextExpiration) {
            if (this.deleteExpiredTimerHandle) {
                clearTimeout(this.deleteExpiredTimerHandle);
            }

            this.nextExpiration = expiration;
            const ttl = this.nextExpiration.diffNow();
            const ttlMs = Math.max(ttl.get("milliseconds"), 0) + 1; // Ensure fired after expiration
            this.deleteExpiredTimerHandle = self.setTimeout(this.deleteExpiredTick, ttlMs);

            this.logger.info(`Next expiration timer will be fired at ${this.nextExpiration.toString()}`, this.nextExpiration);
        }
    }

    /** @internal */
    public async delete(urls: string[]) {
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
            const entries = await this.db.tags.where(nameOf<TagEntry>("url")).anyOf(urls).toArray();
            await this.db.tags.bulkDelete(entries.map(x => x.key));
        });
    }
}

class CacheControlBuilder implements Promise<void> {
    private _isPrivate = false;
    private tags: string[] = [];
    private absoluteExpiration?: DateTime;
    private absoluteExpirationRelativeToNow?: Duration;
    private slidingExpiration?: Duration;
    private commitPromise?: Promise<void>;

    constructor(private url: string, private cacheControl: CacheControl) {
    }

    isPrivate(isPrivate = true) {
        this.ensureNotBuilt();
        this._isPrivate = isPrivate;
        return this;
    }

    hasTags(...tags: string[]) {
        this.ensureNotBuilt();
        this.tags.push(...tags);
        return this;
    }

    hasAbsoluteExpiration(expires: DateTime | Duration) {
        this.ensureNotBuilt();
        if (DateTime.isDateTime(expires)) {
            this.absoluteExpiration = expires;
        }
        else {
            this.absoluteExpirationRelativeToNow = expires;
        }
        return this;
    }

    hasSlidingExpiration(expires: Duration) {
        this.ensureNotBuilt();
        this.slidingExpiration = expires;
        return this;
    }
    
    then<TResult1 = void, TResult2 = never>(onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2> {
        this.commitPromise ??= this.buildPromise();
        return this.commitPromise.then(onfulfilled, onrejected);
    }

    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null): Promise<void | TResult> {
        this.commitPromise ??= this.buildPromise();
        return this.commitPromise.then(onrejected);
    }

    finally(onfinally?: (() => void) | null): Promise<void> {
        this.commitPromise ??= this.buildPromise();
        return this.commitPromise.finally(onfinally);
    }

    [Symbol.toStringTag]: string = Promise.resolve()[Symbol.toStringTag];

    private ensureNotBuilt() {
        if (this.commitPromise) {
            throw new Error("Builder has already been built");
        }
    }

    private async buildPromise() {
        await this.cacheControl.db.ensureValid();

        const promises: Promise<any>[] = [];
        if (this._isPrivate) {
            if (!this.cacheControl.currentPrincipalId) {
                this.cacheControl.logger.warn("No principal is currently configured. Use ensurePrincipal() before making anything private.");
                // Cleanup any cached entries that may exist as we cannot guarantee that they are for this principal.
                await this.cacheControl.db.affiliations.delete(this.url);
                await this.cacheControl.delete([this.url]);
                return;
            }
            promises.push(this.cacheControl.db.affiliations.put({ url: this.url, principalId: this.cacheControl.currentPrincipalId}));
        }

        const entries = this.tags.map(tag => {
            return {
                key: createKey(this.url, tag),
                url: this.url,
                tag: tag,
            };
        });

        promises.push(this.cacheControl.db.tags.bulkPut(entries));

        let nextExpiration: DateTime = NoExpiration;
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
            promises.push(this.cacheControl.db.expirations.put({
                url: this.url,
                created: new Date(),
                nextExpiration: nextExpiration.toJSDate(),
                ... this.absoluteExpiration && { absoluteExpiration: this.absoluteExpiration.toJSDate() },
                ... this.slidingExpiration && { slidingExpiration: this.slidingExpiration.toISO()! },
            }));
        }

        await Promise.all(promises);

        if (nextExpiration.isValid) {
            this.cacheControl.trySetExpiration(nextExpiration);
        }

        if (this.tags.length) {
            this.cacheControl.logger.debug(`Tagged ${this.url} with`, this.tags);
        }
    }
}

const NoExpiration = DateTime.invalid("No expiration");

const GS = String.fromCharCode(0x1D);

function createKey(url: string, tag: string) {
    return url + GS + tag;
}