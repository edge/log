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
exports.Log = exports.LogLevel = exports.StdioAdaptor = exports.LogtailAdaptor = void 0;
var logtail_adaptor_1 = require("./adaptors/logtail-adaptor");
__createBinding(exports, logtail_adaptor_1, "LogtailAdaptor");
var stdio_adaptor_1 = require("./adaptors/stdio-adaptor");
__createBinding(exports, stdio_adaptor_1, "StdioAdaptor");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Debug"] = 0] = "Debug";
    LogLevel[LogLevel["Info"] = 1] = "Info";
    LogLevel[LogLevel["Warn"] = 2] = "Warn";
    LogLevel[LogLevel["Error"] = 3] = "Error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var Log = (function () {
    function Log(adaptors, name, level, context) {
        this.adaptors = [];
        this.context = {};
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
        if (this.level === LogLevel.Debug)
            this.adaptors.forEach(function (adaptor) { return adaptor.debug(_this, message, _this.mergeContexts(context)); });
    };
    Log.prototype.info = function (message, context) {
        var _this = this;
        if (this.level <= LogLevel.Info)
            this.adaptors.forEach(function (adaptor) { return adaptor.info(_this, message, _this.mergeContexts(context)); });
    };
    Log.prototype.warn = function (message, context) {
        var _this = this;
        if (this.level <= LogLevel.Warn)
            this.adaptors.forEach(function (adaptor) { return adaptor.warn(_this, message, _this.mergeContexts(context)); });
    };
    Log.prototype.error = function (message, context) {
        var _this = this;
        if (this.level <= LogLevel.Error)
            this.adaptors.forEach(function (adaptor) { return adaptor.error(_this, message, _this.mergeContexts(context)); });
    };
    Log.prototype.extend = function (name, context) {
        if (typeof name === 'string' && context)
            return new Log(this.adaptors, this.name + ":" + name, this.level, this.mergeContexts(context));
        else if (typeof name === 'string')
            return new Log(this.adaptors, this.name + ":" + name, this.level, this.context);
        else if (name)
            return new Log(this.adaptors, this.name, this.level, this.mergeContexts(name));
        else
            return new Log(this.adaptors, this.name, this.level, this.context);
    };
    Log.prototype.mergeContexts = function (context) {
        if (this.context || context)
            return __assign(__assign({}, this.context), context);
        return undefined;
    };
    return Log;
}());
exports.Log = Log;
