export class CacheOptions {
    runtimeCacheName!: string;
    controlCacheName!: string;
    // DB access timeout in milliseconds
    dbTimeout = 1000;

    setCacheId(cacheId: string, baseUrl?: string) {
        if (!baseUrl) {
            const baseElement = self.document?.querySelector("base");
            baseUrl = baseElement?.href ?? self.location.origin;
        }

        this.runtimeCacheName = `${cacheId}-runtime-${baseUrl}`;
        this.controlCacheName = `${cacheId}-runtime-control-${baseUrl}`;

        return this;
    }

    ensureValid() {
        if (!this.runtimeCacheName || !this.controlCacheName) {
            throw new Error("Cache control is not correctly configured.");
        }
    }
}