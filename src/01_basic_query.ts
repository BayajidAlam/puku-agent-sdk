import { query } from 'puku-agent-sdk';
import { getDemoOptions } from './config.js';

/**
 * Demo 1: Basic Conversational Query
 *
 * Demonstrates how to send a prompt to Puku AI using puku-agent-sdk
 * and receive the assistant's answer and execution metadata.
 */
async function runBasicQueryDemo() {
  console.log('--- [Demo 1] Basic Query to Puku Agent SDK ---');

  const prompt = 'Introduce yourself in 2 concise sentences and explain what Puku Agent SDK does.';
  console.log(`\nUser: "${prompt}"\n`);

  console.log('Sending request to Puku agent...\n');

  // query() returns an AsyncIterable of typed SDKMessage objects
  const stream = query({
    prompt,
    options: getDemoOptions({
      // You can specify model, e.g. 'puku-ai-2.8' or leave default
    }),
  });

  for await (const message of stream) {
    if (message.type === 'assistant') {
      // The assistant message contains an array of content blocks (text or tool use)
      for (const item of message.message.content) {
        const block = item as { type: string; text?: string };
        if (block.type === 'text' && block.text) {
          console.log('Assistant response:\n');
          console.log(block.text);
        }
      }
    } else if (message.type === 'result') {
      // The final result message gives turns, duration, cost, and usage stats
      console.log('\n----------------------------------------');
      console.log(`Status:      ${message.subtype}`);
      console.log(`Turns:       ${message.num_turns}`);
      console.log(`Duration:    ${message.duration_ms} ms`);
      console.log(`Total Cost:  $${message.total_cost_usd?.toFixed(4) ?? '0.0000'}`);
      console.log('----------------------------------------\n');
      break;
    }
  }
  process.exit(0);
}

// Execute demo
runBasicQueryDemo().catch((err) => {
  console.error('Demo error:', err);
  process.exit(1);
});
