/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testMatch: ['**/tests/**/*.ts'],
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'jsdom',
}
