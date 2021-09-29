import chalk from 'chalk';
import { Adapter } from '.';
export declare const logColors: chalk.Chalk[][];
export declare const shortLogLevels: string[];
export declare const adapter: (useStderr?: boolean) => Adapter;
export default adapter;
