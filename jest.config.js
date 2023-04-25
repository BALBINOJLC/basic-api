// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
    transform: tsjPreset.transform,
    testEnvironment: 'node',
    preset: 'ts-jest',
    setupFilesAfterEnv: [],
    coverageDirectory: './coverage',
    collectCoverageFrom: ['src/**/*.ts'],
    coveragePathIgnorePatterns: ['node_modules', '.module.ts', '.config.ts', '.imports.ts', 'main.ts', '.dto.ts'],
    coverageReporters: ['html', 'text', 'text-summary'],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90,
        },
    },
    moduleNameMapper: {
        '@base': '<rootDir>/src/@base/index',
        '@modules': '<rootDir>/src/@modules/index',
        '@casl': '<rootDir>/src/casl/index',
        '@health': '<rootDir>/src/health/index',
        '@utils': '<rootDir>/src/@base/utils/index',
        '@pipes': '<rootDir>/src/@base/pipes/index',
    },
};
