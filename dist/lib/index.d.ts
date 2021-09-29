export * as filter from './filter';
export * as std from './std';
export declare type Adapter = Record<LogLevel, LogFn>;
export declare type Data = Record<string, unknown> | Date | boolean | null | number | string;
export declare type DataObject = Record<string, Data>;
export declare type LogFn = (msg: string, data?: DataObject) => void;
export declare type LogLevel = 'debug' | 'error' | 'info' | 'warn';
export declare type Logger = Adapter & {
    catch: (err: unknown) => void;
};
export declare const create: (adapters: Adapter[]) => Logger;
export declare const parseError: (err: unknown) => [string, DataObject?];
export declare const logLevels: string[];
export declare const logLevelInt: (s: string) => number;
export declare const logLevelsObject: Record<LogLevel, number>;
export declare const logLevelString: (n: number) => string;
