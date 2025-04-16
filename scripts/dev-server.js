const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

// Configuration
const config = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  open: process.env.OPEN !== 'false',
  watch: process.env.WATCH !== 'false',
  proxy: process.env.PROXY || 'http://localhost:3001',
};

// Helper function to check if a port is in use
function isPortInUse(port) {
  return new Promise(resolve => {
    const server = require('net').createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

// Helper function to kill process on port
async function killProcessOnPort(port) {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await require('util').promisify(require('child_process').exec)(
        `netstat -ano | findstr :${port}`
      );
      const lines = stdout.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[4];
          await require('util').promisify(require('child_process').exec)(`taskkill /F /PID ${pid}`);
          console.log(chalk.yellow(`Killed process ${pid} using port ${port}`));
        }
      }
    } else {
      const { stdout } = await require('util').promisify(require('child_process').exec)(
        `lsof -i :${port} -t`
      );
      const pids = stdout.split('\n').filter(Boolean);
      for (const pid of pids) {
        await require('util').promisify(require('child_process').exec)(`kill -9 ${pid}`);
        console.log(chalk.yellow(`Killed process ${pid} using port ${port}`));
      }
    }
  } catch (error) {
    // Ignore errors if no process found
  }
}

// Helper function to start the development server
async function startDevServer() {
  console.log(chalk.blue('Starting development server...'));

  // Check if port is in use
  const portInUse = await isPortInUse(config.port);
  if (portInUse) {
    console.log(
      chalk.yellow(`Port ${config.port} is already in use. Attempting to kill the process...`)
    );
    await killProcessOnPort(config.port);
  }

  // Set environment variables
  process.env.NODE_ENV = 'development';
  process.env.VITE_PORT = config.port;
  process.env.VITE_HOST = config.host;
  process.env.VITE_OPEN = config.open;
  process.env.VITE_WATCH = config.watch;
  process.env.VITE_PROXY = config.proxy;

  // Start Vite dev server
  const viteProcess = spawn('npx', ['vite'], {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  // Handle process events
  viteProcess.on('error', error => {
    console.error(chalk.red('Failed to start development server:'), error);
    process.exit(1);
  });

  process.on('SIGINT', () => {
    console.log(chalk.yellow('\nShutting down development server...'));
    viteProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log(chalk.yellow('\nShutting down development server...'));
    viteProcess.kill('SIGTERM');
    process.exit(0);
  });

  // Log server start
  console.log(chalk.green(`Development server started at http://${config.host}:${config.port}`));
  console.log(chalk.cyan('Press Ctrl+C to stop the server'));
}

// Start the development server
startDevServer().catch(error => {
  console.error(chalk.red('Error starting development server:'), error);
  process.exit(1);
});
