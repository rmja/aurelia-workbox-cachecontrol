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
import { CacheOptions } from './cache-options';
import Dexie from "dexie";
import { autoinject } from 'aurelia-framework';
var CacheContext = /** @class */ (function (_super) {
    __extends(CacheContext, _super);
    function CacheContext(options) {
        var _this = _super.call(this, options.controlCacheName) || this;
        _this.version(1).stores({
            affiliations: "url, principalId",
            tags: "key, tag"
        });
        return _this;
    }
    CacheContext = __decorate([
        autoinject(),
        __metadata("design:paramtypes", [CacheOptions])
    ], CacheContext);
    return CacheContext;
}(Dexie));
export { CacheContext };
//# sourceMappingURL=cache-context.js.map