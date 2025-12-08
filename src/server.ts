import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    const PORT = env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`
========================================
🚀 Server running in ${env.NODE_ENV} mode
📡 Port: ${PORT}
🔗 http://localhost:${PORT}
========================================
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();
