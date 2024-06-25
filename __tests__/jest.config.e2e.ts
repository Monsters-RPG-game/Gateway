import type { JestConfigWithTsJest } from 'ts-jest';
import defaultConfig from './jest.config.default.js';

const config: JestConfigWithTsJest = {
  ...defaultConfig,
  roots: ['./e2e'],
  setupFilesAfterEnv: ['./utils/setup.ts'],
};

export default config;
