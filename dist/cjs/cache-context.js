"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var cache_options_1 = require("./cache-options");
var dexie_1 = require("dexie");
var aurelia_framework_1 = require("aurelia-framework");
var CacheContext = /** @class */ (function (_super) {
    __extends(CacheContext, _super);
    function CacheContext(options) {
        var _this = _super.call(this, options.controlCacheName) || this;
        _this.version(1).stores({
            affiliations: "url, principalId",
            tags: "key, url, tag",
            expirations: "url, nextExpiration"
        });
        return _this;
    }
    CacheContext = __decorate([
        aurelia_framework_1.autoinject(),
        __metadata("design:paramtypes", [cache_options_1.CacheOptions])
    ], CacheContext);
    return CacheContext;
}(dexie_1.default));
exports.CacheContext = CacheContext;
//# sourceMappingURL=cache-context.js.map