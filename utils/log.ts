type LogFn = (message: string, error?: unknown) => void;

const noop: LogFn = () => {};

const devError: LogFn = (message, error) => {
  if (error !== undefined) {
    console.error(message, error);
    return;
  }
  console.error(message);
};

const devWarn: LogFn = (message, error) => {
  if (error !== undefined) {
    console.warn(message, error);
    return;
  }
  console.warn(message);
};

/** No-op in release. Hook a crash reporter here later if needed. */
export const logError: LogFn = __DEV__ ? devError : noop;

export const logWarn: LogFn = __DEV__ ? devWarn : noop;
