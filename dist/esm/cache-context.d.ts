import { CacheOptions } from './cache-options';
import Dexie from "dexie";
export declare class CacheContext extends Dexie {
    affiliations: Dexie.Table<AffiliationEntry, string>;
    tags: Dexie.Table<TagEntry, string>;
    constructor(options: CacheOptions);
}
export interface AffiliationEntry {
    url: string;
    principalId: string;
}
export interface TagEntry {
    key: string;
    tag: string;
}
