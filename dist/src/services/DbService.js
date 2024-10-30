"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_tables_1 = require("@azure/data-tables");
const Utilities_1 = require("./Utilities");
class DbService {
    constructor(okToCacheLocally) {
        this.storageAccountConnectionString = process.env.STORAGE_ACCOUNT_CONNECTION_STRING;
        this.okToCacheLocally = false;
        this.entityCache = [];
        if (!this.storageAccountConnectionString) {
            throw new Error("STORAGE_ACCOUNT_CONNECTION_STRING is not set");
        }
        this.okToCacheLocally = okToCacheLocally;
    }
    getEntityByRowKey(tableName, rowKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.okToCacheLocally) {
                const tableClient = data_tables_1.TableClient.fromConnectionString(this.storageAccountConnectionString, tableName);
                const result = this.expandPropertyValues(yield tableClient.getEntity(tableName, rowKey));
                return result;
            }
            else {
                let result = yield this.getEntities(tableName);
                result = result.filter((e) => {
                    return e.rowKey === rowKey;
                });
                if (result.length === 0) {
                    throw new Utilities_1.HttpError(404, `Entity ${rowKey} not found`);
                }
                else {
                    return result[0];
                }
            }
        });
    }
    getEntities(tableName) {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.okToCacheLocally || this.entityCache.length === 0) {
                // Rebuild cache for this entity
                const tableClient = data_tables_1.TableClient.fromConnectionString(this.storageAccountConnectionString, tableName);
                const entities = tableClient.listEntities();
                this.entityCache = [];
                try {
                    for (var _d = true, entities_1 = __asyncValues(entities), entities_1_1; entities_1_1 = yield entities_1.next(), _a = entities_1_1.done, !_a;) {
                        _c = entities_1_1.value;
                        _d = false;
                        try {
                            const entity = _c;
                            // Remove any duplicates which sometimes occur after a watch restart
                            if (this.entityCache.find((e) => e.rowKey === entity.rowKey) === undefined) {
                                const e = this.expandPropertyValues(entity);
                                this.entityCache.push(e);
                            }
                        }
                        finally {
                            _d = true;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = entities_1.return)) yield _b.call(entities_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            return this.entityCache;
        });
    }
    createEntity(tableName, rowKey, newEntity) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.entityCache = [];
            const entity = this.compressPropertyValues(newEntity);
            const tableClient = data_tables_1.TableClient.fromConnectionString(this.storageAccountConnectionString, tableName);
            try {
                yield tableClient.createEntity(Object.assign({ partitionKey: tableName, rowKey }, entity));
            }
            catch (ex) {
                if (((_a = ex.response) === null || _a === void 0 ? void 0 : _a.status) !== 409) {
                    throw new Utilities_1.HttpError(500, ex.message);
                }
            }
        });
    }
    updateEntity(tableName, updatedEntity) {
        return __awaiter(this, void 0, void 0, function* () {
            this.entityCache = [];
            const e = this.compressPropertyValues(updatedEntity);
            const tableClient = data_tables_1.TableClient.fromConnectionString(this.storageAccountConnectionString, tableName);
            yield tableClient.updateEntity(e, "Replace");
        });
    }
    expandPropertyValues(entity) {
        const result = {};
        for (const key in entity) {
            result[key] = this.expandPropertyValue(entity[key]);
        }
        return result;
    }
    expandPropertyValue(v) {
        if (typeof v === "string" && (v.charAt(0) === '{' || v.charAt(0) === '[')) {
            try {
                return JSON.parse(v);
            }
            catch (e) {
                return v;
            }
        }
        else {
            return v;
        }
    }
    ;
    compressPropertyValues(entity) {
        const result = {};
        for (const key in entity) {
            result[key] = this.compressPropertyValue(entity[key]);
        }
        return result;
    }
    compressPropertyValue(v) {
        if (typeof v === "object") {
            return JSON.stringify(v);
        }
        else {
            return v;
        }
    }
    ;
}
exports.default = DbService;
//# sourceMappingURL=DbService.js.map