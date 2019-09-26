"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var cache_context_1 = require("./cache-context");
var aurelia_framework_1 = require("aurelia-framework");
var cache_options_1 = require("./cache-options");
var CacheControl = /** @class */ (function () {
    function CacheControl(db, options) {
        this.db = db;
        this.runtimeCacheName = options.runtimeCacheName;
        this.logger = aurelia_framework_1.LogManager.getLogger("cache-control");
        options.ensureValid();
    }
    CacheControl.prototype.ensurePrincipal = function (principalId) {
        return __awaiter(this, void 0, void 0, function () {
            var urls;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!principalId) {
                            throw new Error("No principal id is specified, use clearPrivate() if all private entries should be deleted");
                        }
                        this.currentPrincipalId = principalId;
                        return [4 /*yield*/, this.db.transaction("rw", this.db.affiliations, function () { return __awaiter(_this, void 0, void 0, function () {
                                var entries;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.db.affiliations.where("principalId").notEqual(principalId).toArray()];
                                        case 1:
                                            entries = _a.sent();
                                            return [4 /*yield*/, this.db.affiliations.bulkDelete(entries.map(function (x) { return x.url; }))];
                                        case 2:
                                            _a.sent();
                                            urls = entries.map(function (x) { return x.url; });
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.delete(urls)];
                    case 2:
                        _a.sent();
                        if (urls.length) {
                            this.logger.debug("Removed " + urls.length + " private entries");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CacheControl.prototype.clearPrivate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var urls;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.transaction("rw", this.db.affiliations, function () { return __awaiter(_this, void 0, void 0, function () {
                            var entries;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.db.affiliations.toArray()];
                                    case 1:
                                        entries = _a.sent();
                                        return [4 /*yield*/, this.db.affiliations.bulkDelete(entries.map(function (x) { return x.url; }))];
                                    case 2:
                                        _a.sent();
                                        urls = entries.map(function (x) { return x.url; });
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.delete(urls)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CacheControl.prototype.bust = function (tags) {
        return __awaiter(this, void 0, void 0, function () {
            var urls;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.transaction("rw", this.db.tags, function () { return __awaiter(_this, void 0, void 0, function () {
                            var entries;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.db.tags.where("tag").anyOf(tags).toArray()];
                                    case 1:
                                        entries = _a.sent();
                                        return [4 /*yield*/, this.db.tags.bulkDelete(entries.map(function (x) { return x.key; }))];
                                    case 2:
                                        _a.sent();
                                        urls = entries.map(function (x) { return splitKey(x.key).url; });
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        this.logger.debug("Busting urls", urls);
                        return [4 /*yield*/, this.delete(urls)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CacheControl.prototype.let = function (urlOrObjectWithUrl) {
        var url = typeof urlOrObjectWithUrl === "string" ? urlOrObjectWithUrl : urlOrObjectWithUrl.url;
        return new CacheControlBuilder(url, this.db, this.logger, this.currentPrincipalId);
    };
    CacheControl.prototype.delete = function (urls) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, set, keys, _i, keys_1, key;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.runtimeCache) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, caches.open(this.runtimeCacheName)];
                    case 1:
                        _a.runtimeCache = _b.sent();
                        _b.label = 2;
                    case 2:
                        set = new Set(urls);
                        return [4 /*yield*/, this.runtimeCache.keys()];
                    case 3:
                        keys = _b.sent();
                        _i = 0, keys_1 = keys;
                        _b.label = 4;
                    case 4:
                        if (!(_i < keys_1.length)) return [3 /*break*/, 7];
                        key = keys_1[_i];
                        if (!set.has(key.url)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.runtimeCache.delete(key)];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    CacheControl = __decorate([
        aurelia_framework_1.autoinject(),
        __metadata("design:paramtypes", [cache_context_1.CacheContext, cache_options_1.CacheOptions])
    ], CacheControl);
    return CacheControl;
}());
exports.CacheControl = CacheControl;
var CacheControlBuilder = /** @class */ (function () {
    function CacheControlBuilder(url, db, logger, currentPrincipalId) {
        this.url = url;
        this.db = db;
        this.logger = logger;
        this.currentPrincipalId = currentPrincipalId;
        this.private = false;
        this.tags = [];
    }
    CacheControlBuilder.prototype.bePrivate = function () {
        this.private = true;
        return this;
    };
    CacheControlBuilder.prototype.withTags = function () {
        var _a;
        var tags = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tags[_i] = arguments[_i];
        }
        (_a = this.tags).push.apply(_a, tags);
        return this;
    };
    CacheControlBuilder.prototype.commit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promises, entries;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        if (this.private) {
                            if (!this.currentPrincipalId) {
                                throw new Error("No principal is currently configured. Use ensurePrincipal() before making anything private");
                            }
                            promises.push(this.db.affiliations.put({ url: this.url, principalId: this.currentPrincipalId }));
                        }
                        entries = this.tags.map(function (tag) {
                            return {
                                key: createKey(_this.url, tag),
                                tag: tag
                            };
                        });
                        promises.push(this.db.tags.bulkPut(entries));
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        if (this.tags.length) {
                            this.logger.debug("Tagged " + this.url + " with", this.tags);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return CacheControlBuilder;
}());
var GS = String.fromCharCode(0x1D);
function createKey(url, tag) {
    return url + GS + tag;
}
function splitKey(key) {
    var index = key.indexOf(GS);
    return {
        url: key.slice(0, index),
        tag: key.slice(index + 1)
    };
}
//# sourceMappingURL=cache-control.js.map