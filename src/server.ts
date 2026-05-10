import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

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

process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();
