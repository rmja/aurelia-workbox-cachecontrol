export class CacheOptions {
    runtimeCacheName!: string;
    controlCacheName!: string;

    setCacheId(cacheId: string) {
        const baseElement = document.querySelector("base") as HTMLBaseElement;
        const baseUrl = baseElement ? baseElement.href : window.location.origin;

        this.runtimeCacheName = `${cacheId}-runtime-${baseUrl}`;
        this.controlCacheName = `${cacheId}-runtime-control-${baseUrl}`;

        return this;
    }

    ensureValid() {
        if (!this.runtimeCacheName || !this.controlCacheName) {
            throw Error("Cache control is not correctly configured.");
        }
    }
}