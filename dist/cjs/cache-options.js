"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheOptions = void 0;
var CacheOptions = /** @class */ (function () {
    function CacheOptions() {
        // DB access timeout in milliseconds
        this.dbTimeout = 1000;
    }
    CacheOptions.prototype.setCacheId = function (cacheId) {
        var baseElement = document.querySelector("base");
        var baseUrl = baseElement ? baseElement.href : window.location.origin;
        this.runtimeCacheName = cacheId + "-runtime-" + baseUrl;
        this.controlCacheName = cacheId + "-runtime-control-" + baseUrl;
        return this;
    };
    CacheOptions.prototype.ensureValid = function () {
        if (!this.runtimeCacheName || !this.controlCacheName) {
            throw Error("Cache control is not correctly configured.");
        }
    };
    return CacheOptions;
}());
exports.CacheOptions = CacheOptions;
//# sourceMappingURL=cache-options.js.map