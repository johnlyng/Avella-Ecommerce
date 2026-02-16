module.exports = {
    testEnvironment: 'node',
    verbose: true,
    collectCoverageFrom: [
        'services/**/*.js',
        'middleware/**/*.js',
        'routes/**/*.js',
        '!**/__tests__/**'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    testMatch: [
        '**/__tests__/**/*.test.js'
    ],
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js']
};
