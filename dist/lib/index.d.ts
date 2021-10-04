export { LogtailAdaptor } from './adaptors/logtail-adaptor';
export { StdioAdaptor } from './adaptors/stdio-adaptor';
export declare type Adaptor = {
    debug: (log: Log, message: string, context?: Record<string, unknown>) => void;
    info: (log: Log, message: string, context?: Record<string, unknown>) => void;
    warn: (log: Log, message: string, context?: Record<string, unknown>) => void;
    error: (log: Log, message: string, context?: Record<string, unknown>) => void;
};
export declare enum LogLevel {
    Debug = 0,
    Info = 1,
    Warn = 2,
    Error = 3
}
export declare class Log {
    readonly name?: string;
    private adaptors;
    private context?;
    private level;
    constructor(adaptors: Adaptor[]);
    constructor(adaptors: Adaptor[], name?: string);
    constructor(adaptors: Adaptor[], level?: LogLevel);
    constructor(adaptors: Adaptor[], context?: Record<string, unknown>);
    constructor(adaptors: Adaptor[], name?: string, level?: LogLevel);
    constructor(adaptors: Adaptor[], name?: string, context?: Record<string, unknown>);
    constructor(adaptors: Adaptor[], level?: LogLevel, context?: Record<string, unknown>);
    constructor(adaptors: Adaptor[], name?: string, level?: LogLevel, context?: Record<string, unknown>);
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, context?: Record<string, unknown>): void;
    extend(name: string): Log;
    extend(context: Record<string, unknown>): Log;
    extend(name: string, context: Record<string, unknown>): Log;
    private mergeContexts;
}
