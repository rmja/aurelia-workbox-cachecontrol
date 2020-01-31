"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var luxon_1 = require("luxon");
var aurelia_framework_1 = require("aurelia-framework");
var cache_options_1 = require("./cache-options");
var CacheControl = /** @class */ (function () {
    function CacheControl(db, options) {
        this.db = db;
        this.nextExpiration = NoExpiration;
        this.logger = aurelia_framework_1.LogManager.getLogger("cache-control");
        options.ensureValid();
        this.deleteExpiredTick = this.deleteExpiredTick.bind(this);
        this.runtimeCacheOpenPromise = caches.open(options.runtimeCacheName);
    }
    CacheControl.prototype.let = function (urlOrObjectWithUrl) {
        var url = typeof urlOrObjectWithUrl === "string" ? urlOrObjectWithUrl : urlOrObjectWithUrl.url;
        return new CacheControlBuilder(url, this.db, this.logger, this.currentPrincipalId, this.trySetExpiration.bind(this));
    };
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
                        this.logger.debug("Ensuring that private entries in cache belongs to '" + principalId + "'");
                        this.currentPrincipalId = principalId;
                        return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.transaction("rw", this.db.affiliations, function () { return __awaiter(_this, void 0, void 0, function () {
                                var entries;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.db.affiliations.where("principalId").notEqual(principalId).toArray()];
                                        case 1:
                                            entries = _a.sent();
                                            urls = entries.map(function (x) { return x.url; });
                                            return [4 /*yield*/, this.db.affiliations.bulkDelete(entries.map(function (x) { return x.url; }))];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.delete(urls)];
                    case 3:
                        _a.sent();
                        this.logger.debug("Removed " + urls.length + " private entries");
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
                    case 0:
                        this.logger.debug("Deleting all private entries");
                        return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.transaction("rw", this.db.affiliations, function () { return __awaiter(_this, void 0, void 0, function () {
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
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.delete(urls)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CacheControl.prototype.bust = function (tags) {
        return __awaiter(this, void 0, void 0, function () {
            var tagEntries, urls;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.tags.where("tag").anyOf(tags).toArray()];
                    case 2:
                        tagEntries = _a.sent();
                        urls = tagEntries.map(function (x) { return x.url; });
                        return [4 /*yield*/, this.delete(urls)];
                    case 3:
                        _a.sent();
                        this.logger.debug("Busted " + urls.length + " urls", urls);
                        return [2 /*return*/];
                }
            });
        });
    };
    CacheControl.prototype.refresh = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.transaction("rw", this.db.expirations, function () { return __awaiter(_this, void 0, void 0, function () {
                                var expiration;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.db.expirations.get(url)];
                                        case 1:
                                            expiration = _a.sent();
                                            if (!(expiration && expiration.slidingExpiration)) return [3 /*break*/, 3];
                                            expiration.nextExpiration = luxon_1.DateTime.local().plus(luxon_1.Duration.fromISO(expiration.slidingExpiration)).toJSDate();
                                            return [4 /*yield*/, this.db.expirations.update(url, expiration)];
                                        case 2:
                                            _a.sent();
                                            _a.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CacheControl.prototype.ensureInitialized = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.initializingPromise) {
                    this.initializingPromise = this.deleteExpiredTick();
                }
                return [2 /*return*/, this.initializingPromise];
            });
        });
    };
    CacheControl.prototype.deleteExpiredTick = function () {
        return __awaiter(this, void 0, void 0, function () {
            var nextExpirationEntry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.debug("Trying to delete any expired");
                        return [4 /*yield*/, this.db.ensureValid()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.deleteExpired()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.db.expirations.orderBy("nextExpiration").first()];
                    case 3:
                        nextExpirationEntry = _a.sent();
                        if (nextExpirationEntry) {
                            this.trySetExpiration(luxon_1.DateTime.fromJSDate(nextExpirationEntry.nextExpiration));
                        }
                        else {
                            this.nextExpiration = NoExpiration;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CacheControl.prototype.deleteExpired = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, expiredUrls;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = new Date();
                        return [4 /*yield*/, this.db.transaction("rw", this.db.expirations, function () { return __awaiter(_this, void 0, void 0, function () {
                                var expirations;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.db.expirations.where("nextExpiration").belowOrEqual(now).toArray()];
                                        case 1:
                                            expirations = _a.sent();
                                            expiredUrls = expirations.map(function (x) { return x.url; });
                                            return [4 /*yield*/, this.db.expirations.bulkDelete(expiredUrls)];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.delete(expiredUrls)];
                    case 2:
                        _a.sent();
                        this.logger.info("Expired " + expiredUrls.length + " urls");
                        return [2 /*return*/];
                }
            });
        });
    };
    CacheControl.prototype.trySetExpiration = function (expiration) {
        if (!this.nextExpiration.isValid || expiration < this.nextExpiration) {
            if (this.deleteExpiredTimerHandle) {
                clearTimeout(this.deleteExpiredTimerHandle);
            }
            this.nextExpiration = expiration;
            var ttl = this.nextExpiration.diffNow();
            var ttlMs = Math.max(ttl.get("milliseconds"), 0) + 1; // Ensure fired after expiration
            this.deleteExpiredTimerHandle = window.setTimeout(this.deleteExpiredTick, ttlMs);
            this.logger.info("Next expiration timer will be fired at " + this.nextExpiration.toString(), this.nextExpiration);
        }
    };
    CacheControl.prototype.delete = function (urls) {
        return __awaiter(this, void 0, void 0, function () {
            var cache, set, keys, _i, keys_1, key;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.runtimeCache) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.runtimeCacheOpenPromise];
                    case 1:
                        cache = _a.sent();
                        if (!this.runtimeCache) {
                            this.runtimeCache = cache;
                        }
                        _a.label = 2;
                    case 2:
                        set = new Set(urls);
                        return [4 /*yield*/, this.runtimeCache.keys()];
                    case 3:
                        keys = _a.sent();
                        _i = 0, keys_1 = keys;
                        _a.label = 4;
                    case 4:
                        if (!(_i < keys_1.length)) return [3 /*break*/, 7];
                        key = keys_1[_i];
                        if (!set.has(key.url)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.runtimeCache.delete(key)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: 
                    // Delete tags
                    return [4 /*yield*/, this.db.transaction("rw", this.db.tags, function () { return __awaiter(_this, void 0, void 0, function () {
                            var entries;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.db.tags.where("url").anyOf(urls).toArray()];
                                    case 1:
                                        entries = _a.sent();
                                        return [4 /*yield*/, this.db.tags.bulkDelete(entries.map(function (x) { return x.key; }))];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 8:
                        // Delete tags
                        _a.sent();
                        return [2 /*return*/];
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
    function CacheControlBuilder(url, db, logger, currentPrincipalId, trySetExpiration) {
        this.url = url;
        this.db = db;
        this.logger = logger;
        this.currentPrincipalId = currentPrincipalId;
        this.trySetExpiration = trySetExpiration;
        this.private = false;
        this.tags = [];
    }
    CacheControlBuilder.prototype.bePrivate = function () {
        this.private = true;
        return this;
    };
    CacheControlBuilder.prototype.haveTags = function () {
        var _a;
        var tags = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tags[_i] = arguments[_i];
        }
        (_a = this.tags).push.apply(_a, tags);
        return this;
    };
    CacheControlBuilder.prototype.haveAbsoluteExpiration = function (expires) {
        if (luxon_1.DateTime.isDateTime(expires)) {
            this.absoluteExpiration = expires;
        }
        else {
            this.absoluteExpirationRelativeToNow = expires;
        }
        return this;
    };
    CacheControlBuilder.prototype.haveSlidingExpiration = function (expires) {
        this.slidingExpiration = expires;
    };
    CacheControlBuilder.prototype.commit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promises, entries, nextExpiration;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.ensureValid()];
                    case 1:
                        _a.sent();
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
                                url: _this.url,
                                tag: tag,
                            };
                        });
                        promises.push(this.db.tags.bulkPut(entries));
                        nextExpiration = NoExpiration;
                        if (this.absoluteExpiration) {
                            nextExpiration = this.absoluteExpiration;
                        }
                        else if (this.absoluteExpirationRelativeToNow) {
                            nextExpiration = luxon_1.DateTime.local().plus(this.absoluteExpirationRelativeToNow);
                        }
                        else if (this.slidingExpiration) {
                            nextExpiration = luxon_1.DateTime.local().plus(this.slidingExpiration);
                        }
                        if (nextExpiration.isValid) {
                            promises.push(this.db.expirations.put(__assign(__assign({ url: this.url, created: new Date(), nextExpiration: nextExpiration.toJSDate() }, this.absoluteExpiration && { absoluteExpiration: this.absoluteExpiration.toJSDate() }), this.slidingExpiration && { slidingExpiration: this.slidingExpiration.toISO() })));
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 2:
                        _a.sent();
                        if (nextExpiration.isValid) {
                            this.trySetExpiration(nextExpiration);
                        }
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
var NoExpiration = luxon_1.DateTime.invalid("No expiration");
var GS = String.fromCharCode(0x1D);
function createKey(url, tag) {
    return url + GS + tag;
}
//# sourceMappingURL=cache-control.js.map