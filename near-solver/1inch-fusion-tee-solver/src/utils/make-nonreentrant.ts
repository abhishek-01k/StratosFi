type AsyncFunction<T extends any[], R> = (...args: T) => Promise<R>;

export function makeNonReentrant<T extends any[], R>(
  fn: AsyncFunction<T, R>
): AsyncFunction<T, R> {
  let isExecuting = false;
  let pendingPromise: Promise<R> | null = null;

  return async function (this: any, ...args: T): Promise<R> {
    if (isExecuting) {
      if (pendingPromise) {
        return pendingPromise;
      }
      throw new Error('Function is already executing');
    }

    isExecuting = true;
    
    try {
      pendingPromise = fn.apply(this, args);
      const result = await pendingPromise;
      return result;
    } finally {
      isExecuting = false;
      pendingPromise = null;
    }
  };
}