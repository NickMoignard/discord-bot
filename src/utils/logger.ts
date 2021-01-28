import * as path from 'path';
import config from 'config';
import * as winston from 'winston';
import type Transport from 'winston-transport';
import LogzioWinstonTransport from 'winston-logzio';

import { isProductionEnvironment } from './env';

const hasLogzIoConfig = config.has('logging.logzIoToken');
const isProduction = isProductionEnvironment();

const logger = winston.createLogger({
    transports: [
        !isProduction && new winston.transports.Console(),
        isProduction && new winston.transports.File({ filename: path.resolve(__dirname, '../logs/server.log') }),
    ].filter(Boolean) as Transport[],
    level: config.get<string>('logging.level'),
});

if (isProduction) {
    winston.remove(winston.transports.Console);
}

export default logger;
