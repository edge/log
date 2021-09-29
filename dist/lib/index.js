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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
exports.__esModule = true;
exports.logLevelString = exports.logLevelsObject = exports.logLevelInt = exports.logLevels = exports.parseError = exports.create = exports.std = exports.filter = void 0;
exports.filter = __importStar(require("./filter"));
exports.std = __importStar(require("./std"));
var create = function (adapters) { return ({
    "catch": function (err) { return adapters.forEach(function (adapter) { return adapter.error.apply(adapter, (0, exports.parseError)(err)); }); },
    debug: function (msg, data) { return adapters.forEach(function (adapter) { return adapter.debug(msg, data); }); },
    error: function (msg, data) { return adapters.forEach(function (adapter) { return adapter.error(msg, data); }); },
    info: function (msg, data) { return adapters.forEach(function (adapter) { return adapter.info(msg, data); }); },
    warn: function (msg, data) { return adapters.forEach(function (adapter) { return adapter.warn(msg, data); }); }
}); };
exports.create = create;
var parseError = function (err) {
    var msg = 'caught error';
    var data = {};
    if (err instanceof Error) {
        msg = err.toString();
        if (err.stack !== undefined)
            data.stack = err.stack;
    }
    else
        switch (typeof err) {
            case 'string':
                msg = err;
                break;
            case 'boolean':
            case 'number':
                data.err = err;
                break;
            case 'object':
                if (err !== null)
                    data.err = err.toString();
                break;
            default:
                data.err = '[unsupported data]';
                break;
        }
    return [msg, Object.keys(data).length ? data : undefined];
};
exports.parseError = parseError;
exports.logLevels = ['debug', 'info', 'warn', 'error'];
var logLevelInt = function (s) {
    var n = exports.logLevels.indexOf(s);
    if (n < 0)
        throw new Error("invalid LogLevel \"" + s + "\"");
    return n;
};
exports.logLevelInt = logLevelInt;
exports.logLevelsObject = exports.logLevels.reduce(function (a, b, i) {
    var _a;
    return (__assign(__assign({}, a), (_a = {}, _a[b] = i, _a)));
}, {});
var logLevelString = function (n) {
    if (n < 0 || n >= exports.logLevels.length)
        throw new Error("invalid LogLevel " + n);
    return exports.logLevels[n];
};
exports.logLevelString = logLevelString;
