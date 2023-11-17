/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  rootDir: __dirname,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
};