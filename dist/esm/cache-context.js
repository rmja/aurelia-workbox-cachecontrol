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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { LogManager, autoinject } from 'aurelia-framework';
import { CacheOptions } from './cache-options';
import Dexie from "dexie";
var CacheContext = /** @class */ (function (_super) {
    __extends(CacheContext, _super);
    function CacheContext(options) {
        var _this = _super.call(this, options.controlCacheName) || this;
        _this.logger = LogManager.getLogger("cache-control");
        _this.version(1).stores({
            affiliations: "url, principalId",
            tags: "key, url, tag",
            expirations: "url, nextExpiration"
        });
        _this.dbTimeout = options.dbTimeout;
        _this.validatingPromise = _this.runValidation();
        return _this;
    }
    CacheContext.prototype.ensureValid = function () {
        return this.validatingPromise;
    };
    CacheContext.prototype.runValidation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, cancelPromise, cancelTimer, error_1, deleteContext, _i, _b, table, error_2, _c, cancelPromise, cancelTimer, error_3, _d, cancelPromise, cancelTimer, error_4;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        this.logger.debug("Starting context validation");
                        if (!!this.isOpen()) return [3 /*break*/, 5];
                        this.logger.debug("Context is not open, opening...");
                        _a = this.createCancelTimeout(), cancelPromise = _a[0], cancelTimer = _a[1];
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, Promise.race([this.open(), cancelPromise])];
                    case 2:
                        _e.sent();
                        this.logger.debug("Context was opened");
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _e.sent();
                        this.logger.error("Failed to open context", error_1);
                        throw error_1;
                    case 4:
                        clearTimeout(cancelTimer);
                        return [7 /*endfinally*/];
                    case 5:
                        deleteContext = false;
                        _e.label = 6;
                    case 6:
                        _e.trys.push([6, 11, , 12]);
                        _i = 0, _b = this.tables;
                        _e.label = 7;
                    case 7:
                        if (!(_i < _b.length)) return [3 /*break*/, 10];
                        table = _b[_i];
                        this.logger.debug("Validating table '" + table.name + "'");
                        return [4 /*yield*/, table.limit(1).toArray()];
                    case 8:
                        _e.sent();
                        _e.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 7];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        error_2 = _e.sent();
                        this.logger.warn("Failed to run simple table query", error_2);
                        deleteContext = true;
                        return [3 /*break*/, 12];
                    case 12:
                        if (!deleteContext) return [3 /*break*/, 17];
                        this.logger.warn("Deleting context");
                        _c = this.createCancelTimeout(), cancelPromise = _c[0], cancelTimer = _c[1];
                        _e.label = 13;
                    case 13:
                        _e.trys.push([13, 15, 16, 17]);
                        return [4 /*yield*/, Promise.race([this.delete(), cancelPromise])];
                    case 14:
                        _e.sent();
                        return [3 /*break*/, 17];
                    case 15:
                        error_3 = _e.sent();
                        this.logger.error("Failed to delete context", error_3);
                        throw error_3;
                    case 16:
                        clearTimeout(cancelTimer);
                        return [7 /*endfinally*/];
                    case 17:
                        if (!!this.isOpen()) return [3 /*break*/, 22];
                        this.logger.debug("Context is not open after possible delete, opening...");
                        _d = this.createCancelTimeout(), cancelPromise = _d[0], cancelTimer = _d[1];
                        _e.label = 18;
                    case 18:
                        _e.trys.push([18, 20, 21, 22]);
                        return [4 /*yield*/, Promise.race([this.open(), cancelPromise])];
                    case 19:
                        _e.sent();
                        return [3 /*break*/, 22];
                    case 20:
                        error_4 = _e.sent();
                        this.logger.error("Failed to open context", error_4);
                        throw error_4;
                    case 21:
                        clearTimeout(cancelTimer);
                        return [7 /*endfinally*/];
                    case 22:
                        this.logger.info("Context was successfully validated");
                        return [2 /*return*/];
                }
            });
        });
    };
    CacheContext.prototype.createCancelTimeout = function () {
        var cancelOpen;
        var cancelPromise = new Promise(function (_, reject) { return cancelOpen = reject; });
        var timer = window.setTimeout(function () { return cancelOpen(new Error("Timeout while accessing database")); }, this.dbTimeout);
        return [cancelPromise, timer];
    };
    CacheContext = __decorate([
        autoinject(),
        __metadata("design:paramtypes", [CacheOptions])
    ], CacheContext);
    return CacheContext;
}(Dexie));
export { CacheContext };
//# sourceMappingURL=cache-context.js.map