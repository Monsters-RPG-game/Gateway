/**
 * Generate random name, with selected length characters. Default length is 12.
 * @param length Length of random string.
 * @returns Randomized name.
 */
export const generateRandomName = (length: number = 12): string => {
  const vocabulary = 'ABCDEFGHIJKLMNOUPRSTUWZabcdefghijklmnouprstuwz';
  let name = '';
  for (let x = 0; x < length; x++) {
    name += vocabulary[Math.floor(Math.random() * vocabulary.length)];
  }
  return name;
};

/**
 * Generate temporary client id.
 * @returns Randomized id.
 */
export const generateTempId = (): string => {
  let id = '';
  for (let x = 0; x < 20; x++) {
    id += Math.round(Math.random() * 10);
  }

  return id;
};

export const sleep = async (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
};
