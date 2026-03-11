const http = require('http');
const config = require('./config');
const { initDatabase, close: closeDb } = require('./database');
const { app, joinAllPublicChannels } = require('./slackApp');

let healthServer;

async function start() {
  initDatabase();
  console.log('Database initialized');

  // Start Slack bot via Socket Mode (no public URL needed)
  await app.start();
  console.log('Slack bot connected via Socket Mode');

  // Auto-join all public channels
  await joinAllPublicChannels();

  // Standalone health check server (for Render / monitoring)
  healthServer = http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  });
  healthServer.listen(config.port, () => {
    console.log(`Health check: http://localhost:${config.port}/health`);
  });
}

function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  if (healthServer) healthServer.close();
  closeDb();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start().catch((error) => {
  console.error('Failed to start the application:', error);
  closeDb();
  process.exit(1);
});
