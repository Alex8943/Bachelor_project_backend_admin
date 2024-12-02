module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverage: true,
    collectCoverageFrom: [
      'src/routes/**/*.{js,ts}', // Include all files in the `routes` folder
      '!src/rabbitmq*/*',       // Exclude all RabbitMQ files and folders
      '!src/other_services/**', // Exclude the entire `other_services` folder
      '!src/**/*.d.ts',         // Exclude TypeScript declaration files
      '!src/**/index.{js,ts}',  // Exclude index files (optional)
      '!src/routes/updateRouter.ts', // Exclude updateRouter.ts
      '!src/db_service/**/*.d.ts', // Exclude the entire `db_service` folder
    ],
    globals: {
      'ts-jest': {
        tsconfig: './tsconfig.json',
      },
    },
  };
  