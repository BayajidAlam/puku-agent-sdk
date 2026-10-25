import readline from 'node:readline';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function printBanner() {
  console.log(`
============================================================
              🚀 PUKU AGENT SDK - DEMO APP
============================================================
Welcome to the Puku Agent SDK demonstration application.
This project demonstrates how to build intelligent, autonomous
agents using the official \`puku-agent-sdk\`.

Environment Status:
  • Node.js:        ${process.version}
  • PUKU_AI_API_KEY: ${process.env.PUKU_AI_API_KEY ? 'Configured ✅' : 'Not set (using default CLI auth) ℹ️'}
============================================================
`);
}

function printMenu() {
  console.log(`Select a demo to run:
  1) Basic Query            (Ask a question and receive complete answer)
  2) Real-Time Streaming    (Stream response tokens in real-time)
  3) Structured JSON Output (Extract strongly typed data using JSON Schema)
  4) Custom In-Process Tools(Register custom functions via MCP)
  5) Run All Demos in Sequence
  0) Exit
`);
}

function runScript(scriptRelativePath: string): Promise<void> {
  return new Promise((resolve) => {
    const fullPath = path.resolve(__dirname, scriptRelativePath);
    console.log(`\n>>> Running: ${scriptRelativePath}...\n`);

    const child = spawn(process.execPath, [
      '--import',
      'tsx',
      fullPath,
    ], {
      stdio: 'inherit',
      env: process.env,
    });

    child.on('close', () => {
      resolve();
    });
  });
}

async function main() {
  printBanner();

  const arg = process.argv[2];
  if (arg === '--all') {
    await runScript('01_basic_query.ts');
    await runScript('02_streaming.ts');
    await runScript('03_structured_output.ts');
    await runScript('04_custom_tools.ts');
    console.log('\nAll demos completed successfully!\n');
    process.exit(0);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const promptUser = () => {
    printMenu();
    rl.question('Enter your choice (0-5): ', async (choice) => {
      const trimmed = choice.trim();

      switch (trimmed) {
        case '1':
          await runScript('01_basic_query.ts');
          promptUser();
          break;
        case '2':
          await runScript('02_streaming.ts');
          promptUser();
          break;
        case '3':
          await runScript('03_structured_output.ts');
          promptUser();
          break;
        case '4':
          await runScript('04_custom_tools.ts');
          promptUser();
          break;
        case '5':
          await runScript('01_basic_query.ts');
          await runScript('02_streaming.ts');
          await runScript('03_structured_output.ts');
          await runScript('04_custom_tools.ts');
          promptUser();
          break;
        case '0':
        case 'exit':
        case 'q':
          console.log('\nThank you for exploring Puku Agent SDK! Goodbye.\n');
          rl.close();
          process.exit(0);
          break;
        default:
          console.log('\nInvalid choice. Please enter a number between 0 and 5.\n');
          promptUser();
          break;
      }
    });
  };

  promptUser();
}

main().catch((err) => {
  console.error('Application error:', err);
  process.exit(1);
});
