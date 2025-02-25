import type { JestConfigWithTsJest } from 'ts-jest';
import defaultConfig from './jest.config.default';

const config: JestConfigWithTsJest = {
  ...defaultConfig,
  setupFilesAfterEnv: ['./__tests__/integration/setup.ts'],
};

export default config;
