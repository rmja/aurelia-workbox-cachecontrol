import { CacheOptions } from "./src/cache-options";

declare module "aurelia-framework" {
    interface FrameworkConfiguration {
        plugin(plugin: "aurelia-workbox-cachecontrol", configureAction: (options: CacheOptions) => unknown): FrameworkConfiguration;
    }
}