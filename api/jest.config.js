module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    roots: ['<rootDir>'],
    testMatch: ['**/__tests__/**/*.test.[jt]s'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    collectCoverageFrom: [
        'services/**/*.{js,ts}',
        'middleware/**/*.{js,ts}',
        'routes/**/*.{js,ts}',
        '!**/__tests__/**',
        '!**/node_modules/**'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: {
                esModuleInterop: true,
                allowSyntheticDefaultImports: true
            }
        }]
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1'
    }
};
