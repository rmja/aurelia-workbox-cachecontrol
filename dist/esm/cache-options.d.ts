export declare class CacheOptions {
    runtimeCacheName: string;
    controlCacheName: string;
    dbTimeout: number;
    setCacheId(cacheId: string): this;
    ensureValid(): void;
}
