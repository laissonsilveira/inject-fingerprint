const { createLogger, format, transports } = require('winston');
const { combine, colorize, simple, timestamp, label, printf } = format;
const myFormat = printf(({ level, message, label, timestamp }) => `[${label}] ${timestamp} - ${level}: ${message}`);

module.exports = level => {
    return createLogger({
        level,
        silent: !level,
        format: combine(
            simple(),
            colorize(),
            timestamp({ format: 'DD/MM/YY HH:mm:ss' }),
            label({ label: `${process.ppid}|${process.pid}` }),
            myFormat
        ),
        transports: [new transports.Console()]
    });
};