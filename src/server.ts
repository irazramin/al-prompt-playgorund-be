import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import app from './app';
import config from './config';
import { connectDatabase } from './config/database';
import logger from './utils/logger';

const PORT = config.port;

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT} in ${config.env} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
