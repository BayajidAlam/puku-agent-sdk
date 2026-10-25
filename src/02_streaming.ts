import { query } from 'puku-agent-sdk';
import { getDemoOptions } from './config.js';

/**
 * Demo 2: Real-time Streaming Output
 *
 * Demonstrates how to stream tokens from Puku AI in real time
 * as they are generated using `includePartialMessages: true`.
 */
async function runStreamingDemo() {
  console.log('--- [Demo 2] Real-time Streaming with Puku Agent SDK ---');

  const prompt = 'Tell a 3-sentence motivational tip for software engineers.';
  console.log(`\nUser: "${prompt}"\n`);
  console.log('Streaming response in real time: \n');

  // Passing includePartialMessages: true causes the SDK to emit 'stream_event'
  const stream = query({
    prompt,
    options: getDemoOptions({
      includePartialMessages: true,
    }),
  });

  for await (const message of stream) {
    if (message.type === 'stream_event') {
      const event = message.event as {
        type?: string;
        delta?: { type?: string; text?: string };
      };

      // Stream text deltas directly to standard output without newlines
      if (event?.type === 'content_block_delta' && event.delta?.text) {
        process.stdout.write(event.delta.text);
      }
    } else if (message.type === 'result') {
      console.log('\n\n----------------------------------------');
      console.log(`Stream complete!`);
      console.log(`Duration:    ${message.duration_ms} ms`);
      console.log(`Total Cost:  $${message.total_cost_usd?.toFixed(4) ?? '0.0000'}`);
      console.log('----------------------------------------\n');
      break;
    }
  }

  process.exit(0);
}

runStreamingDemo().catch((err) => {
  console.error('\nStreaming error:', err);
  process.exit(1);
});
