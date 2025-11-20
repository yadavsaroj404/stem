import fs from 'fs';
import path from 'path';

enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

const LOG_DIR = path.join(process.cwd(), 'logs');

// Ensure log directory exists on the server
if (typeof window === 'undefined' && !fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const getLogFilePath = () => {
  const date = new Date().toISOString().split('T')[0];
  return path.join(LOG_DIR, `app-${date}.log`);
};

const formatMessage = (level: LogLevel, message: string, context?: object): string => {
  const timestamp = new Date().toISOString();
  let logMessage = `${timestamp} [${level}] - ${message}`;
  if (context) {
    try {
      logMessage += `\nContext: ${JSON.stringify(context, null, 2)}`;
    } catch (error) {
      // Avoid crashing if context is not serializable
      logMessage += `\nContext: [Unserializable]`;
    }
  }
  return logMessage;
};

const logToServer = (level: LogLevel, message: string, context?: object) => {
  const formattedMessage = formatMessage(level, message, context) + '\n';
  try {
    fs.appendFileSync(getLogFilePath(), formattedMessage);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
};

const logToConsole = (level: LogLevel, message: string, context?: object) => {
  const formattedMessage = formatMessage(level, message, context);
  switch (level) {
    case LogLevel.INFO:
      console.info(formattedMessage);
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage);
      break;
    case LogLevel.ERROR:
      console.error(formattedMessage);
      break;
    case LogLevel.DEBUG:
      console.debug(formattedMessage);
      break;
    default:
      console.log(formattedMessage);
  }
};

const isServer = typeof window === 'undefined';

const logger = {
  info: (message: string, context?: object) => {
    if (isServer) {
      logToServer(LogLevel.INFO, message, context);
    } else {
      logToConsole(LogLevel.INFO, message, context);
    }
  },
  warn: (message: string, context?: object) => {
    if (isServer) {
      logToServer(LogLevel.WARN, message, context);
    } else {
      logToConsole(LogLevel.WARN, message, context);
    }
  },
  error: (message: string, error: Error, context?: object) => {
    const errorMessage = `${message}\nError: ${error.message}\nStack: ${error.stack}`;
    if (isServer) {
      logToServer(LogLevel.ERROR, errorMessage, context);
    } else {
      logToConsole(LogLevel.ERROR, errorMessage, context);
    }
  },
  debug: (message: string, context?: object) => {
    // Debug logs should only appear in development
    if (process.env.NODE_ENV === 'development') {
      if (isServer) {
        logToServer(LogLevel.DEBUG, message, context);
      } else {
        logToConsole(LogLevel.DEBUG, message, context);
      }
    }
  },
};

export default logger;
