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

        if (!baseUrl.endsWith("/")) {
            // base.href example is "https://localhost:5000/" but location.origin does not have a trailing "/".
            // Make sure that the two are aligned in case that "the app" has a base tag "/", and an associated service worker is used which cannot find the base tag.
            baseUrl += "/";
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