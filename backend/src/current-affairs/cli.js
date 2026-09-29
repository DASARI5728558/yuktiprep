#!/usr/bin/env node
import { Command } from 'commander';
import * as path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { initDb, syncSources } from './pipeline.js';
import {
  generateDaily,
  generateWeekly,
  generateMonthly,
  themeReport,
  questionReport,
  healthReport,
  errorsReport,
} from './pipeline.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('yuktiprep-ca')
  .description('YuktiPrep official-source-first current-affairs engine');

program
  .command('init')
  .description('Initialize the database')
  .action(async () => {
    await initDb();
    console.log('Database initialized.');
  });

program
  .command('sync')
  .description('Synchronize official sources')
  .action(async () => {
    const stats = await syncSources();
    console.log(stats);
  });

program
  .command('daily')
  .description('Generate daily current affairs')
  .action(async () => {
    const output = await generateDaily();
    writeOutput(output, 'daily.md');
  });

program
  .command('weekly')
  .description('Generate weekly digest')
  .action(async () => {
    const output = await generateWeekly();
    writeOutput(output, 'weekly.md');
  });

program
  .command('monthly')
  .description('Generate monthly archive')
  .action(async () => {
    const output = await generateMonthly();
    writeOutput(output, 'monthly.md');
  });

program
  .command('themes')
  .description('Generate theme report')
  .action(async () => {
    const output = await themeReport();
    writeOutput(output, 'themes.md');
  });

program
  .command('questions')
  .description('Generate expected questions')
  .action(async () => {
    const output = await questionReport();
    writeOutput(output, 'expected_questions.md');
  });

program
  .command('health')
  .description('Show source health report')
  .action(async () => {
    const rows = await healthReport();
    for (const row of rows) {
      console.log({ ...row });
    }
  });

program
  .command('errors')
  .description('Show dead-letter errors')
  .action(async () => {
    const rows = await errorsReport(100);
    for (const row of rows) {
      console.log({ ...row });
    }
  });

program
  .command('serve')
  .description('Launch web dashboard')
  .option('--host <host>', 'Host address', '127.0.0.1')
  .option('--port <port>', 'Port number', '8000')
  .action(async (options) => {
    process.env.PORT = String(options.port);
    const { startServer } = await import('./web.js');
    startServer();
  });

function writeOutput(text, filename) {
  const outputDir = path.join(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const target = path.join(outputDir, filename);
  fs.writeFileSync(target, text, 'utf-8');
  console.log(`Wrote: ${target}`);
}

program.parse();
