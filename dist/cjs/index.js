"use strict";
/// <reference types="ts-nameof" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.configure = exports.CacheContext = exports.CacheControl = void 0;
var cache_context_1 = require("./cache-context");
Object.defineProperty(exports, "CacheContext", { enumerable: true, get: function () { return cache_context_1.CacheContext; } });
var cache_control_1 = require("./cache-control");
Object.defineProperty(exports, "CacheControl", { enumerable: true, get: function () { return cache_control_1.CacheControl; } });
var cache_options_1 = require("./cache-options");
function configure(frameworkConfig, configureAction) {
    var options = frameworkConfig.container.get(cache_options_1.CacheOptions);
    configureAction(options);
}
exports.configure = configure;
//# sourceMappingURL=index.js.map