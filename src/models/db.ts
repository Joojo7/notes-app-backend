import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'DB_USER',
  'DB_PASSWORD',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// Sequelize instance singleton
let sequelize: Sequelize;

const getSequelizeInstance = (): Sequelize => {
  // Create the instance only if it hasn't been created already
  if (!sequelize) {
    console.log('Creating new Sequelize instance...');

    sequelize = new Sequelize(
      `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      {
        dialect: 'postgres',
        logging: false,
        pool: {
          max: 5,          // Max number of connections in the pool
          min: 0,          // Min number of connections in the pool
          acquire: 30000,  // Maximum time, in milliseconds, that pool will try to get a connection before throwing an error
          idle: 10000,     // Maximum time, in milliseconds, that a connection can be idle before being released
        },
      }
    );
  }
  return sequelize;
};

// Test connection function
const testConnection = async () => {
  const sequelizeInstance = getSequelizeInstance();

  try {
    console.log('Testing database connection...');
    await sequelizeInstance.authenticate();
    await sequelizeInstance.sync({ force: false });
    console.log('Database connection successful');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Call the connection test on startup
testConnection();

export default getSequelizeInstance();
