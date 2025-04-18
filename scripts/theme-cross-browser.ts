import puppeteer, { Browser, Page } from 'puppeteer';
import chalk from 'chalk';
import { ThemeConfig } from '../src/core/theme/consolidated-types';
import fs from 'fs';
import path from 'path';

interface BrowserTest {
  name: string;
  test: (page: Page) => Promise<void>;
}

interface TestError extends Error {
  message: string;
}

interface BrowserConfig {
  name: string;
  engine: string;
  launchOptions: Record<string, any>;
}

const BROWSERS: BrowserConfig[] = [
  { 
    name: 'Chrome',
    engine: 'chrome',
    launchOptions: {
      headless: 'new',
      args: ['--no-sandbox']
    }
  },
  { 
    name: 'Firefox',
    engine: 'firefox',
    launchOptions: {
      headless: 'new',
      product: 'firefox'
    }
  }
];

const REPORT_DIR = 'test-reports';
const REPORT_FILE = path.join(REPORT_DIR, 'theme-cross-browser-report.md');

async function saveTestReport(content: string) {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR);
  }
  fs.appendFileSync(REPORT_FILE, content + '\n');
}

const themeTests: BrowserTest[] = [
  {
    name: 'CSS Variables Support',
    test: async (page: Page) => {
      const support = await page.evaluate(() => {
        const root = document.documentElement;
        root.style.setProperty('--test-var', 'test');
        return getComputedStyle(root).getPropertyValue('--test-var').trim() === 'test';
      });
      if (!support) throw new Error('CSS Variables not supported');
    }
  },
  {
    name: 'Theme Application',
    test: async (page: Page) => {
      await page.waitForSelector('[data-testid="app-root"]', { timeout: 5000 });
      const themeApplied = await page.evaluate(() => {
        const root = document.documentElement;
        const primaryColor = getComputedStyle(root).getPropertyValue('--color-primary').trim();
        console.log('Primary color:', primaryColor);
        return primaryColor !== '';
      });
      if (!themeApplied) throw new Error('Theme not properly applied');
    }
  },
  {
    name: 'Theme Switching',
    test: async (page: Page) => {
      await page.waitForSelector('[data-testid="theme-switch"]', { timeout: 5000 });
      const initialBg = await page.evaluate(() => {
        const root = document.documentElement;
        return getComputedStyle(root).backgroundColor;
      });
      
      await page.click('[data-testid="theme-switch"]');
      await page.waitForTimeout(1000); // Wait longer for transition
      
      const newBg = await page.evaluate(() => {
        const root = document.documentElement;
        return getComputedStyle(root).backgroundColor;
      });
      
      if (initialBg === newBg) {
        throw new Error('Theme switching failed - background color did not change');
      }
    }
  },
  {
    name: 'Responsive Breakpoints',
    test: async (page: Page) => {
      const viewports = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1440, height: 900, name: 'desktop' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewport(viewport);
        await page.waitForTimeout(1000);
        
        const breakpointApplied = await page.evaluate((size) => {
          const root = document.documentElement;
          const breakpoint = getComputedStyle(root).getPropertyValue(`--breakpoint-${size}`).trim();
          console.log(`Breakpoint ${size}:`, breakpoint);
          return breakpoint !== '';
        }, viewport.name === 'mobile' ? 'sm' : viewport.name === 'tablet' ? 'md' : 'lg');
        
        if (!breakpointApplied) {
          throw new Error(`Breakpoint not working for ${viewport.name} viewport`);
        }
      }
    }
  },
  {
    name: 'Animation Support',
    test: async (page: Page) => {
      const animationSupport = await page.evaluate(() => {
        const root = document.documentElement;
        const duration = getComputedStyle(root).getPropertyValue('--transition-duration-normal').trim();
        console.log('Transition duration:', duration);
        return duration !== '';
      });
      if (!animationSupport) throw new Error('Animation properties not supported');
    }
  }
];

async function runTests(): Promise<void> {
  console.log(chalk.blue('\nStarting Cross-Browser Theme Testing\n'));
  
  // Clear previous report
  if (fs.existsSync(REPORT_FILE)) {
    fs.unlinkSync(REPORT_FILE);
  }
  
  await saveTestReport('# Theme Cross-Browser Test Report\n');
  await saveTestReport(`Date: ${new Date().toISOString()}\n`);
  
  for (const browser of BROWSERS) {
    console.log(chalk.yellow(`\nTesting in ${browser.name}...\n`));
    await saveTestReport(`\n## ${browser.name}\n`);
    
    try {
      const browserInstance = await puppeteer.launch(browser.launchOptions);
      const page = await browserInstance.newPage();
      
      // Enable console logging from the page
      page.on('console', msg => console.log('Browser Console:', msg.text()));
      
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
      
      for (const test of themeTests) {
        try {
          await test.test(page);
          console.log(chalk.green(`✓ ${test.name}`));
          await saveTestReport(`- ✅ ${test.name}`);
        } catch (err) {
          const error = err as TestError;
          console.log(chalk.red(`✗ ${test.name}`));
          console.log(chalk.red(`  Error: ${error.message}`));
          await saveTestReport(`- ❌ ${test.name}\n  - Error: ${error.message}`);
        }
      }
      
      await browserInstance.close();
    } catch (err) {
      const error = err as TestError;
      console.log(chalk.red(`Failed to run tests in ${browser.name}`));
      console.log(chalk.red(`Error: ${error.message}`));
      await saveTestReport(`\n### ❌ Failed to run tests\nError: ${error.message}\n`);
    }
  }
  
  console.log(chalk.blue('\nCross-Browser Testing Complete\n'));
  console.log(chalk.blue(`Report saved to ${REPORT_FILE}\n`));
}

// Run the tests
runTests(); 