export { LogtailAdaptor } from './adaptors/logtail-adaptor';
export { StdioAdaptor } from './adaptors/stdio-adaptor';
export declare type Adaptor = {
    debug: (log: Log, message: string, context?: Record<string, unknown>) => void;
    info: (log: Log, message: string, context?: Record<string, unknown>) => void;
    warn: (log: Log, message: string, context?: Record<string, unknown>) => void;
    error: (log: Log, message: string, context?: Record<string, unknown>) => void;
};
export declare type LogContext = Record<string, unknown> | Error | Date | boolean | null | number | string;
export declare enum LogLevel {
    Debug = 0,
    Info = 1,
    Warn = 2,
    Error = 3
}
export declare type SerializedLogContext = Record<string, unknown> | boolean | null | number | string;
export declare function LogLevelFromString(level: string): LogLevel;
export declare class Log {
    readonly name?: string;
    private adaptors;
    private context?;
    private level;
    constructor(name?: string);
    constructor(name?: string, level?: LogLevel);
    constructor(name?: string, context?: Record<string, unknown>);
    constructor(name?: string, level?: LogLevel, context?: Record<string, unknown>);
    constructor(level?: LogLevel);
    constructor(level?: LogLevel, context?: Record<string, unknown>);
    constructor(context?: Record<string, unknown>);
    constructor(adaptors?: Adaptor[]);
    constructor(adaptors?: Adaptor[], name?: string);
    constructor(adaptors?: Adaptor[], level?: LogLevel);
    constructor(adaptors?: Adaptor[], context?: Record<string, unknown>);
    constructor(adaptors?: Adaptor[], name?: string, level?: LogLevel);
    constructor(adaptors?: Adaptor[], name?: string, context?: Record<string, unknown>);
    constructor(adaptors?: Adaptor[], level?: LogLevel, context?: Record<string, unknown>);
    constructor(adaptors?: Adaptor[], name?: string, level?: LogLevel, context?: Record<string, unknown>);
    use(adaptor: Adaptor): void;
    setLogLevel(level: LogLevel): void;
    debug(message: string): void;
    debug(context: LogContext): void;
    debug(message: string, context?: LogContext): void;
    info(message: string): void;
    info(context: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string): void;
    warn(context: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string): void;
    error(context: LogContext): void;
    error(message: string, context?: LogContext): void;
    extend(name: string): Log;
    extend(context: LogContext): Log;
    extend(name: string, context: LogContext): Log;
    private mergeContexts;
}
