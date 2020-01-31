/// <reference types="ts-nameof" />

import { CacheContext } from './cache-context';
import { CacheControl } from './cache-control';
import { CacheOptions } from "./cache-options";
import { FrameworkConfiguration } from "aurelia-framework";

export { CacheControl, CacheContext };

export function configure(frameworkConfig: FrameworkConfiguration, configureAction: (options: CacheOptions) => unknown) {
    const options = frameworkConfig.container.get(CacheOptions);

    configureAction(options);
}