"use strict";
/// <reference types="ts-nameof" />
Object.defineProperty(exports, "__esModule", { value: true });
var cache_control_1 = require("./cache-control");
exports.CacheControl = cache_control_1.CacheControl;
var cache_options_1 = require("./cache-options");
function configure(frameworkConfig, configureAction) {
    var options = frameworkConfig.container.get(cache_options_1.CacheOptions);
    configureAction(options);
}
exports.configure = configure;
//# sourceMappingURL=index.js.map