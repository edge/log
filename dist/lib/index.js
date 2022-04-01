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
exports.__esModule = true;
exports.Log = exports.LogLevelFromString = exports.LogLevel = exports.StdioAdaptor = exports.NewRelicAdaptor = exports.LogtailAdaptor = exports.ElasticAdaptor = void 0;
var elastic_adaptor_1 = require("./adaptors/elastic-adaptor");
__createBinding(exports, elastic_adaptor_1, "ElasticAdaptor");
var logtail_adaptor_1 = require("./adaptors/logtail-adaptor");
__createBinding(exports, logtail_adaptor_1, "LogtailAdaptor");
var newrelic_adaptor_1 = require("./adaptors/newrelic-adaptor");
__createBinding(exports, newrelic_adaptor_1, "NewRelicAdaptor");
var stdio_adaptor_1 = require("./adaptors/stdio-adaptor");
__createBinding(exports, stdio_adaptor_1, "StdioAdaptor");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Debug"] = 0] = "Debug";
    LogLevel[LogLevel["Info"] = 1] = "Info";
    LogLevel[LogLevel["Warn"] = 2] = "Warn";
    LogLevel[LogLevel["Error"] = 3] = "Error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
function LogLevelFromString(level) {
    var levelLower = level.toLowerCase();
    if (levelLower === 'debug')
        return LogLevel.Debug;
    else if (levelLower === 'info')
        return LogLevel.Info;
    else if (levelLower === 'warn')
        return LogLevel.Warn;
    else if (levelLower === 'error')
        return LogLevel.Error;
    else
        return LogLevel.Info;
}
exports.LogLevelFromString = LogLevelFromString;
function disambiguate(message, context) {
    if (typeof message === 'string')
        return [message, serialize(context)];
    if (typeof message === 'number')
        return ["" + message, serialize(context)];
    if (typeof message === 'boolean')
        return ["" + message, serialize(context)];
    if (message === null)
        return ['null', serialize(context)];
    if (message instanceof Date)
        return [message.toString(), serialize(context)];
    if (message instanceof Error)
        return [message.toString(), mergeContexts(message, mergeContexts(context, {}) || {})];
    return ['', mergeContexts(message, mergeContexts(context, {}) || {})];
}
function mergeContexts(context, into) {
    if (context === undefined)
        return;
    var serialized = serialize(context);
    switch (typeof serialized) {
        case 'string':
        case 'boolean':
        case 'number':
            into._ = serialized.toString();
            break;
        case 'object':
            if (serialized === null) {
                into._ = null;
                break;
            }
            Object.keys(serialized).forEach(function (k) {
                into[k] = serialized[k];
            });
            break;
        default:
            into._ = context;
    }
    return Object.keys(into).length ? into : undefined;
}
function serialize(context) {
    switch (typeof context) {
        case 'string':
        case 'boolean':
        case 'number':
            return context.toString();
        case 'object':
            if (context instanceof Error) {
                return {
                    message: context.message,
                    name: context.name,
                    stack: context.stack
                };
            }
            else if (context instanceof Date)
                return context.toString();
            else if (context !== null) {
                var newContext_1 = {};
                Object.keys(context).forEach(function (k) {
                    newContext_1[k] = serialize(context[k]);
                });
                return newContext_1;
            }
            return context;
        default:
            return context;
    }
}
var Log = (function () {
    function Log(adaptors, name, level, context) {
        this.adaptors = [];
        this.level = LogLevel.Info;
        if (Array.isArray(adaptors))
            this.adaptors = adaptors;
        if (typeof adaptors === 'string')
            this.name = adaptors;
        else if (typeof adaptors === 'number')
            this.level = adaptors;
        else if (adaptors && !Array.isArray(adaptors))
            this.context = adaptors;
        if (typeof name === 'string')
            this.name = name;
        else if (typeof name === 'number')
            this.level = name;
        else if (name)
            this.context = name;
        if (typeof level === 'number')
            this.level = level;
        else if (level)
            this.context = level;
        if (context)
            this.context = context;
    }
    Log.prototype.use = function (adaptor) {
        this.adaptors.push(adaptor);
    };
    Log.prototype.setLogLevel = function (level) {
        this.level = level;
    };
    Log.prototype.debug = function (message, context) {
        var _this = this;
        if (this.level > LogLevel.Debug)
            return;
        var _a = disambiguate(message, context), fwdMessage = _a[0], fwdContext = _a[1];
        this.adaptors.forEach(function (adaptor) { return adaptor.debug(_this, fwdMessage, _this.mergeContexts(fwdContext)); });
    };
    Log.prototype.info = function (message, context) {
        var _this = this;
        if (this.level > LogLevel.Info)
            return;
        var _a = disambiguate(message, context), fwdMessage = _a[0], fwdContext = _a[1];
        this.adaptors.forEach(function (adaptor) { return adaptor.info(_this, fwdMessage, _this.mergeContexts(fwdContext)); });
    };
    Log.prototype.warn = function (message, context) {
        var _this = this;
        if (this.level > LogLevel.Warn)
            return;
        var _a = disambiguate(message, context), fwdMessage = _a[0], fwdContext = _a[1];
        this.adaptors.forEach(function (adaptor) { return adaptor.warn(_this, fwdMessage, _this.mergeContexts(fwdContext)); });
    };
    Log.prototype.error = function (message, context) {
        var _this = this;
        if (this.level > LogLevel.Error)
            return;
        var _a = disambiguate(message, context), fwdMessage = _a[0], fwdContext = _a[1];
        this.adaptors.forEach(function (adaptor) { return adaptor.error(_this, fwdMessage, _this.mergeContexts(fwdContext)); });
    };
    Log.prototype.extend = function (name, context) {
        if (typeof name === 'string' && context) {
            return new Log(this.adaptors, [this.name, name].filter(Boolean).join(':'), this.level, this.mergeContexts(context));
        }
        else if (typeof name === 'string') {
            return new Log(this.adaptors, [this.name, name].filter(Boolean).join(':'), this.level, this.context);
        }
        else if (name) {
            return new Log(this.adaptors, this.name, this.level, this.mergeContexts(name));
        }
        else {
            return new Log(this.adaptors, this.name, this.level, this.context);
        }
    };
    Log.prototype.mergeContexts = function (context) {
        return mergeContexts(context, __assign({}, this.context));
    };
    return Log;
}());
exports.Log = Log;
