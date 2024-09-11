import dotenv from 'dotenv';

dotenv.config();

const environment = process.env.NODE_ENV; 
const commonConfig = {
    current_env: environment,
};

export const devConfig = {
    ...commonConfig,
    dbConfig: {
        mysql: {
            mysql_host: process.env.dev_host,
            mysql_user: process.env.dev_user,
            mysql_password: process.env.dev_password,
            mysql_database: process.env.dev_database,
            mysql_port: process.env.dev_port,
        },
    },
};

export const config = (process.env.NODE_ENV === 'development') ? devConfig : commonConfig;
