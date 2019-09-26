import { AffiliationEntry, CacheContext, TagEntry } from "./cache-context";
import { LogManager, autoinject } from "aurelia-framework";

import { CacheOptions } from './cache-options';
import { Logger } from "aurelia-logging";

export interface ICacheControlBuilder {
    bePrivate(): ICacheControlBuilder;
    withTags(...tags: string[]): ICacheControlBuilder;
    commit(): Promise<void>;
}

@autoinject()
export class CacheControl {
    private runtimeCacheName: string;
    private runtimeCache?: Cache;
    private logger: Logger;
    public currentPrincipalId?: string;

    constructor(private db: CacheContext, options: CacheOptions) {
        this.runtimeCacheName = options.runtimeCacheName;
        this.logger = LogManager.getLogger("cache-control");

        options.ensureValid();
    }

    async ensurePrincipal(principalId: string) {
        if (!principalId) {
            throw new Error("No principal id is specified, use clearPrivate() if all private entries should be deleted");
        }

        this.currentPrincipalId = principalId;

        let urls!: string[];

        await this.db.transaction("rw", this.db.affiliations, async () => {
            const entries = await this.db.affiliations.where(nameof<AffiliationEntry>(x => x.principalId)).notEqual(principalId).toArray();
            await this.db.affiliations.bulkDelete(entries.map(x => x.url));
            urls = entries.map(x => x.url);
        });

        await this.delete(urls);

        if (urls.length) {
            this.logger.debug(`Removed ${urls.length} private entries`);
        }
    }

    async clearPrivate() {
        let urls!: string[];

        await this.db.transaction("rw", this.db.affiliations, async () => {
            const entries = await this.db.affiliations.toArray();
            await this.db.affiliations.bulkDelete(entries.map(x => x.url));
            urls = entries.map(x => x.url);
        });

        await this.delete(urls);
    }

    async bust(tags: string[]) {
        let urls!: string[];

        await this.db.transaction("rw", this.db.tags, async () => {
            const entries = await this.db.tags.where(nameof<TagEntry>(x => x.tag)).anyOf(tags).toArray();
            await this.db.tags.bulkDelete(entries.map(x => x.key));
            urls = entries.map(x => splitKey(x.key).url);
        });

        this.logger.debug("Busting urls", urls);

        await this.delete(urls);
    }

    let(urlOrObjectWithUrl: string | { url: string }) {
        const url = typeof urlOrObjectWithUrl === "string" ? urlOrObjectWithUrl : urlOrObjectWithUrl.url;
        return new CacheControlBuilder(url, this.db, this.logger, this.currentPrincipalId);
    }

    private async delete(urls: string[]) {
        if (!this.runtimeCache) {
            this.runtimeCache = await caches.open(this.runtimeCacheName);
        }

        const set = new Set(urls);
        const keys = await this.runtimeCache.keys();

        for (const key of keys) {
            if (set.has(key.url)) {
                await this.runtimeCache.delete(key);
            }
        }
    }
}

class CacheControlBuilder implements ICacheControlBuilder {
    private private = false;
    private tags: string[] = [];

    constructor(private url: string, private db: CacheContext, private logger: Logger, private currentPrincipalId: string | undefined) {
    }

    bePrivate() {
        this.private = true;
        return this;
    }

    withTags(...tags: string[]) {
        this.tags.push(...tags);
        return this;
    }

    async commit() {
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
                tag: tag
            };
        });

        promises.push(this.db.tags.bulkPut(entries));

        await Promise.all(promises);

        if (this.tags.length) {
            this.logger.debug(`Tagged ${this.url} with`, this.tags);
        }
    }
}

const GS = String.fromCharCode(0x1D);

function createKey(url: string, tag: string) {
    return url + GS + tag;
}

function splitKey(key: string) {
    const index = key.indexOf(GS);
    return {
        url: key.slice(0, index),
        tag: key.slice(index + 1)
    };
}