import { CacheOptions } from './cache-options';
import Dexie from "dexie";
import { autoinject } from 'aurelia-framework';

@autoinject()
export class CacheContext extends Dexie {
    affiliations!: Dexie.Table<AffiliationEntry, string>;
    tags!: Dexie.Table<TagEntry, string>;
    expirations!: Dexie.Table<ExpirationEntry, string>;

    constructor(options: CacheOptions) {
        super(options.controlCacheName);

        this.version(1).stores({
            affiliations: "url, principalId",
            tags: "key, url, tag",
            expirations: "url, nextExpiration"
        });
    }
}

export interface AffiliationEntry {
    url: string;
    principalId: string;
}

export interface TagEntry {
    key: string;
    url: string;
    tag: string;
}

export interface ExpirationEntry {
    url: string;
    created: Date;
    nextExpiration: Date;

    absoluteExpiration?: Date;
    slidingExpiration?: string;
}