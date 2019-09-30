import { CacheOptions } from './cache-options';
import Dexie from "dexie";
export declare class CacheContext extends Dexie {
    affiliations: Dexie.Table<AffiliationEntry, string>;
    tags: Dexie.Table<TagEntry, string>;
    expirations: Dexie.Table<ExpirationEntry, string>;
    private isValidated;
    constructor(options: CacheOptions);
    ensureValid(): Promise<void>;
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
