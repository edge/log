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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.ElasticAdaptor = void 0;
var superagent_1 = __importDefault(require("superagent"));
var ElasticAdaptor = (function () {
    function ElasticAdaptor(config, options) {
        this.interval = undefined;
        if (!config.apiKey && !config.username) {
            throw new Error('API key or username/password required');
        }
        this.config = config;
        this.options = options || {};
        this.queue = [];
        if (this.config.bulkCycle !== false)
            this.startCycle();
    }
    ElasticAdaptor.prototype.debug = function (log, message, context) {
        this.log(log, 'debug', message, context);
    };
    ElasticAdaptor.prototype.info = function (log, message, context) {
        this.log(log, 'info', message, context);
    };
    ElasticAdaptor.prototype.warn = function (log, message, context) {
        this.log(log, 'warn', message, context);
    };
    ElasticAdaptor.prototype.error = function (log, message, context) {
        this.log(log, 'error', message, context);
    };
    ElasticAdaptor.prototype.log = function (log, level, message, context) {
        var timestamp = (new Date()).toISOString();
        var data = __assign({ '@timestamp': timestamp, name: log.name, level: level, message: message, context: context }, this.options);
        if (this.config.bulkCycle === false)
            this.send('_doc', data);
        else
            this.queue.push(data);
    };
    ElasticAdaptor.prototype.postQueue = function () {
        if (this.queue.length === 0)
            return;
        var docs = this.queue;
        this.queue = [];
        var create = JSON.stringify({ create: {} });
        var data = docs.reduce(function (s, doc) {
            s.push(create, JSON.stringify(doc));
            return s;
        }, []).join('\n');
        this.send('_bulk', data + '\n');
    };
    ElasticAdaptor.prototype.send = function (endpoint, data) {
        return __awaiter(this, void 0, void 0, function () {
            var url, req, auth, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        url = this.config.host + "/" + this.config.dataStream + "/" + endpoint;
                        req = endpoint === '_bulk' ? superagent_1["default"].put(url) : superagent_1["default"].post(url);
                        req.set('Content-Type', 'application/json').send(data);
                        if (this.config.apiKey)
                            req.set('Authorization', "apikey " + this.config.apiKey);
                        else {
                            auth = Buffer.from(this.config.username + ":" + this.config.password, 'utf-8').toString('base64');
                            req.set('Authorization', "basic " + auth);
                        }
                        if (this.config.cert)
                            req.ca(this.config.cert);
                        else if (this.config.cert === false)
                            req.disableTLSCerts();
                        return [4, req];
                    case 1:
                        _a.sent();
                        return [3, 3];
                    case 2:
                        err_1 = _a.sent();
                        console.error(err_1);
                        return [3, 3];
                    case 3: return [2];
                }
            });
        });
    };
    ElasticAdaptor.prototype.startCycle = function () {
        this.interval = setInterval(this.postQueue.bind(this), this.config.bulkCycle || 1000);
    };
    ElasticAdaptor.prototype.stopCycle = function () {
        if (this.interval !== undefined)
            clearInterval(this.interval);
        this.interval = undefined;
    };
    return ElasticAdaptor;
}());
exports.ElasticAdaptor = ElasticAdaptor;
