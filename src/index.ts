import { CacheContext } from "./cache-context";
import { CacheControl } from "./cache-control";
import { CacheOptions } from "./cache-options";
import { FrameworkConfiguration } from "aurelia-framework";

export { CacheControl, CacheContext, CacheOptions };

export function configure(
  frameworkConfig: FrameworkConfiguration,
  configureAction: (options: CacheOptions) => unknown,
) {
  const options = frameworkConfig.container.get(CacheOptions);

  configureAction(options);
}

declare module "aurelia-framework" {
  interface FrameworkConfiguration {
      plugin(plugin: "aurelia-workbox-cachecontrol", configureAction: (options: CacheOptions) => unknown): FrameworkConfiguration;
  }
}