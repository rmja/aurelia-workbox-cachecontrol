import { CacheContext } from "./cache-context";
import { DateTime, Duration } from "luxon";
import { CacheOptions } from './cache-options';
import { Logger } from "aurelia-logging";
export interface ICacheControlBuilder {
    bePrivate(): ICacheControlBuilder;
    haveTags(...tags: string[]): ICacheControlBuilder;
    commit(): Promise<void>;
}
export declare class CacheControl {
    private db;
    private runtimeCacheName;
    private runtimeCache?;
    private logger;
    currentPrincipalId?: string;
    private deleteExpiredTimerHandle;
    private nextExpiration;
    constructor(db: CacheContext, options: CacheOptions);
    let(urlOrObjectWithUrl: string | {
        url: string;
    }): CacheControlBuilder;
    ensurePrincipal(principalId: string): Promise<void>;
    clearPrivate(): Promise<void>;
    bust(tags: string[]): Promise<void>;
    refresh(url: string): Promise<void>;
    private deleteExpiredTick;
    private deleteExpired;
    private trySetExpiration;
    private delete;
}
declare class CacheControlBuilder implements ICacheControlBuilder {
    private url;
    private db;
    private logger;
    private currentPrincipalId;
    private trySetExpiration;
    private private;
    private tags;
    private absoluteExpiration?;
    private absoluteExpirationRelativeToNow?;
    private slidingExpiration?;
    constructor(url: string, db: CacheContext, logger: Logger, currentPrincipalId: string | undefined, trySetExpiration: (expiration: DateTime) => void);
    bePrivate(): this;
    haveTags(...tags: string[]): this;
    haveAbsoluteExpiration(expires: DateTime | Duration): this;
    haveSlidingExpiration(expires: Duration): void;
    commit(): Promise<void>;
}
export {};
