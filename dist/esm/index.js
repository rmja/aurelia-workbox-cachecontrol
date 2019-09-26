/// <reference types="ts-nameof" />
import { CacheControl } from './cache-control';
import { CacheOptions } from "./cache-options";
export { CacheControl };
export function configure(frameworkConfig, configureAction) {
    var options = frameworkConfig.container.get(CacheOptions);
    configureAction(options);
}
//# sourceMappingURL=index.js.map