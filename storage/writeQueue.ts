/** Runs async storage tasks one at a time so read-modify-write calls cannot clobber each other. */
export const createWriteQueue = () => {
  let chain: Promise<void> = Promise.resolve();

  return <T>(task: () => Promise<T>): Promise<T> => {
    const result = chain.then(task, task);
    chain = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  };
};
