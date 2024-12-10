module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },

    
    transform: {
        '^.+\\.ts$': 'ts-jest', // Use ts-jest to transform TypeScript files
      },
      transformIgnorePatterns: [
        '/node_modules/', // Ignore transformation of node_modules
      ],
      coveragePathIgnorePatterns: [
        '/node_modules/',
      ],
    
  };
  