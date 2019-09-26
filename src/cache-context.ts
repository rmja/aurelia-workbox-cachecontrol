import { CacheOptions } from './cache-options';
import Dexie from "dexie";
import { autoinject } from 'aurelia-framework';

@autoinject()
export class CacheContext extends Dexie {
    affiliations!: Dexie.Table<AffiliationEntry, string>;
    tags!: Dexie.Table<TagEntry, string>;

    constructor(options: CacheOptions) {
        super(options.controlCacheName);

        this.version(1).stores({
            affiliations: "url, principalId",
            tags: "key, tag"
        });
    }
}

export interface AffiliationEntry {
    url: string;
    principalId: string;
}

export interface TagEntry {
    key: string;
    tag: string;
}