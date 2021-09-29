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
exports.__esModule = true;
exports.withoutData = exports.withName = exports.withData = exports.minimumLogLevel = void 0;
var _1 = require(".");
var minimumLogLevel = function (next, minLevel) {
    var level = typeof minLevel === 'string' ? (0, _1.logLevelInt)(minLevel) : minLevel;
    return {
        "catch": function (err) { return _1.logLevelsObject.error >= level && next["catch"](err); },
        debug: function (msg, data) { return _1.logLevelsObject.debug >= level && next.debug(msg, data); },
        error: function (msg, data) { return _1.logLevelsObject.error >= level && next.error(msg, data); },
        info: function (msg, data) { return _1.logLevelsObject.info >= level && next.info(msg, data); },
        warn: function (msg, data) { return _1.logLevelsObject.warn >= level && next.warn(msg, data); }
    };
};
exports.minimumLogLevel = minimumLogLevel;
var withData = function (next, alwaysData) {
    var update = function (data) {
        if (data !== undefined)
            return __assign(__assign({}, alwaysData), data);
        return __assign({}, alwaysData);
    };
    return {
        "catch": function (err) {
            var _a = (0, _1.parseError)(err), msg = _a[0], data = _a[1];
            next.error(msg, update(data));
        },
        debug: function (msg, data) { return next.debug(msg, update(data)); },
        error: function (msg, data) { return next.error(msg, update(data)); },
        info: function (msg, data) { return next.info(msg, update(data)); },
        warn: function (msg, data) { return next.warn(msg, update(data)); }
    };
};
exports.withData = withData;
var withName = function (next, loggerName) { return (0, exports.withData)(next, { loggerName: loggerName }); };
exports.withName = withName;
var withoutData = function (next, neverData) {
    var cleanup = function (data) {
        if (data === undefined)
            return undefined;
        var safeKeys = Object.keys(data).filter(function (k) { return neverData.indexOf(k) === -1; });
        if (safeKeys.length === 0)
            return undefined;
        return safeKeys.reduce(function (a, b) {
            var _a;
            return (__assign(__assign({}, a), (_a = {}, _a[b] = data[b], _a)));
        }, {});
    };
    return {
        "catch": function (err) {
            var _a = (0, _1.parseError)(err), msg = _a[0], data = _a[1];
            next.error(msg, cleanup(data));
        },
        debug: function (msg, data) { return next.debug(msg, cleanup(data)); },
        error: function (msg, data) { return next.error(msg, cleanup(data)); },
        info: function (msg, data) { return next.info(msg, cleanup(data)); },
        warn: function (msg, data) { return next.warn(msg, cleanup(data)); }
    };
};
exports.withoutData = withoutData;
