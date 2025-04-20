/**
 * Kill Test Dashboard Script
 * 
 * This script kills any running test dashboard processes on the default ports.
 */

const { execSync } = require('child_process');
const chalk = require('chalk');

// Array of ports to check
const ports = [3456, 3457, 3458, 3459];

console.log(chalk.cyan('Stopping any running test dashboard instances...'));

// For Windows
try {
  ports.forEach(port => {
    try {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      if (result) {
        const lines = result.split('\n');
        lines.forEach(line => {
          if (line.includes('LISTENING')) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid) {
              try {
                console.log(chalk.yellow(`Killing process ${pid} on port ${port}`));
                execSync(`taskkill /F /PID ${pid}`);
                console.log(chalk.green(`✓ Process ${pid} terminated`));
              } catch (e) {
                console.log(chalk.red(`Failed to kill process ${pid}: ${e.message}`));
              }
            }
          }
        });
      }
    } catch (error) {
      // No process found on this port - that's ok
    }
  });
} catch (error) {
  console.log(chalk.red(`Error checking processes: ${error.message}`));
}

console.log(chalk.green('✅ Done checking for test dashboard processes')); 