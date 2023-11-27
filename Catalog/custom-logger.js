const winstonLogger = require("winston");
const pathModule = require("path");
const projectRoot = pathModule.join(__dirname, "..");

const loggerConfiguration = {
    transports: [
        new winstonLogger.transports.Console({
            format: winstonLogger.format.combine(
                winstonLogger.format.colorize({
                    all: true
                })
            )
        }),
        new winstonLogger.transports.File({
            filename: 'logs/m.log'
        })
    ],
    format: winstonLogger.format.combine(
        winstonLogger.format.errors({ stack: true }),
        winstonLogger.format.label({
            label: `Label🏷️`
        }),
        winstonLogger.format.timestamp({
            format: 'DD-MM-YYYY HH:mm:ss:SSS'
        }),
        winstonLogger.format.printf(info => {
            if (info.level == "error") {
                return `---------------------------
[${info.level.toUpperCase()}] ${[info.timestamp]} ===> 
${info.message} 
--------------------------`;
            } else {
                return `[${info.level.toUpperCase()}] ${[info.timestamp]} ===> ${info.message} `;
            }
        }),
    ),
};

const myLogger = winstonLogger.createLogger(loggerConfiguration);
module.exports.myInfo = function () {
    myLogger.info.apply(myLogger, formatLogArguments(arguments));
};
module.exports.myLog = function () {
    myLogger.info.apply(myLogger, formatLogArguments(arguments));
};
module.exports.myWarn = function () {
    myLogger.warn.apply(myLogger, formatLogArguments(arguments));
};
module.exports.myDebug = function () {
    myLogger.debug.apply(myLogger, formatLogArguments(arguments));
};
module.exports.myVerbose = function () {
    myLogger.verbose.apply(myLogger, formatLogArguments(arguments));
};
module.exports.myError = function () {
    myLogger.error.apply(myLogger, formatLogArguments(arguments));
};

function formatLogArguments(args) {
    args = Array.prototype.slice.call(args);
    const stackInfo = getStackInfo(1);

    if (stackInfo) {
        const calleeStr = `(${stackInfo.relativePath}:${stackInfo.line})`;

        args[0] = JSON.stringify(args[0], null, 2);
        if (typeof args[0] === "string") {
            args[0] = args[0] + "  ---  " + calleeStr;
        } else if (isJsonParsable(args[0])) {
            args[0] = JSON.stringify(args[0], null, 2);
        }
        else {

            args[0] = args[0] + "  ---  " + calleeStr;
        }
    }
    return args;
}

function getStackInfo(stackIndex) {
    const stackList = new Error().stack.split("\n").slice(3);
    const stackRegex = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;
    const stackRegex2 = /at\s+()(.*):(\d*):(\d*)/gi;

    const s = stackList[stackIndex] || stackList[0];
    const stackParts = stackRegex.exec(s) || stackRegex2.exec(s);

    if (stackParts && stackParts.length === 5) {
        return {
            method: stackParts[1],
            relativePath: pathModule.relative(projectRoot, stackParts[2]),
            line: stackParts[3],
            pos: stackParts[4],
            file: pathModule.basename(stackParts[2]),
            stack: stackList.join("\n")
        };
    }
}

function stri(arg) {
    return `${arg}`;
}
var isJsonParsable = string => {
    try {
        JSON.parse(string);
    } catch (e) {
        return false;
    }
    return true;
}

myLogger.exitOnError = false;
