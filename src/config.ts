import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import type { Options } from 'puku-agent-sdk';

// Load .env if present
dotenv.config();

/**
 * Resolves the path to the puku-cli executable or script across Windows, macOS, and Linux.
 * On Windows, running node directly against the CLI script avoids shell escaping issues.
 */
export function resolvePukuCli(): {
  executable?: 'node' | 'bun' | 'deno';
  executableArgs?: string[];
  pathToPukuCliExecutable?: string;
} {
  // If explicitly configured via environment variable
  if (process.env.PUKU_CLI_PATH && fs.existsSync(process.env.PUKU_CLI_PATH)) {
    return { pathToPukuCliExecutable: process.env.PUKU_CLI_PATH };
  }

  // Windows npm global install detection
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || '';
    const winCliScript = path.join(appData, 'npm', 'node_modules', '@puku', 'puku-cli', 'bin', 'puku-cli');
    if (fs.existsSync(winCliScript)) {
      return {
        executable: 'node',
        executableArgs: [winCliScript],
      };
    }
  }

  // Fallback to standard CLI on PATH
  return {};
}

/**
 * Helper to build clean, cross-platform Puku SDK query options.
 */
export function getDemoOptions(overrides: Partial<Options> = {}): Options {
  const cliConfig = resolvePukuCli();

  const options: Options = {
    ...cliConfig,
    ...overrides,
  };

  // Attach API key if present in environment
  const apiKey = process.env.PUKU_AI_API_KEY || process.env.PUKU_API_KEY;
  if (apiKey) {
    options.env = {
      PUKU_AI_API_KEY: apiKey,
      PUKU_API_KEY: apiKey,
      ...(process.env.PUKU_BASE_URL ? { PUKU_BASE_URL: process.env.PUKU_BASE_URL } : {}),
      ...(overrides.env || {}),
    };
  }

  return options;
}
