import { CacheContext } from "./cache-context";
import { CacheOptions } from './cache-options';
import { Logger } from "aurelia-logging";
export interface ICacheControlBuilder {
    bePrivate(): ICacheControlBuilder;
    withTags(...tags: string[]): ICacheControlBuilder;
    commit(): Promise<void>;
}
export declare class CacheControl {
    private db;
    private runtimeCacheName;
    private runtimeCache?;
    private logger;
    currentPrincipalId?: string;
    constructor(db: CacheContext, options: CacheOptions);
    ensurePrincipal(principalId: string): Promise<void>;
    clearPrivate(): Promise<void>;
    bust(tags: string[]): Promise<void>;
    let(urlOrObjectWithUrl: string | {
        url: string;
    }): CacheControlBuilder;
    private delete;
}
declare class CacheControlBuilder implements ICacheControlBuilder {
    private url;
    private db;
    private logger;
    private currentPrincipalId;
    private private;
    private tags;
    constructor(url: string, db: CacheContext, logger: Logger, currentPrincipalId: string | undefined);
    bePrivate(): this;
    withTags(...tags: string[]): this;
    commit(): Promise<void>;
}
export {};
