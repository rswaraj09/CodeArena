const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./websocket/socket');

/**
 * Standalone entrypoint — use this for local dev or for hosting on any
 * platform with a persistent process and a Docker daemon (a VM, Render,
 * Railway, Fly.io, etc). This is the ONLY entrypoint that gets the Docker
 * judge and the live Socket.IO leaderboard working, since both need a
 * long-lived process.
 *
 * For Vercel serverless, use api/index.js instead — see README.md.
 */
async function start() {
  await connectDB();
  console.log('Connected to MongoDB');

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`CodeArena backend (Express) listening on port ${env.port} [${env.nodeEnv}]`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
