import { CacheContext } from './cache-context';
import { CacheControl } from './cache-control';
import { CacheOptions } from "./cache-options";
import { FrameworkConfiguration } from "aurelia-framework";
export { CacheControl, CacheContext };
export declare function configure(frameworkConfig: FrameworkConfiguration, configureAction: (options: CacheOptions) => unknown): void;
