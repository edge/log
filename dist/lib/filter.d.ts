import { Adapter, DataObject, Logger } from '.';
export declare const minimumLogLevel: (next: Logger, minLevel: number | string) => Logger;
export declare const withData: (next: Adapter, alwaysData: DataObject) => Logger;
export declare const withName: (next: Adapter, loggerName: string) => Logger;
export declare const withoutData: (next: Adapter, neverData: string[]) => Logger;
