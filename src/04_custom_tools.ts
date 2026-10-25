import { z } from 'zod';
import { createSdkMcpServer, query, tool } from 'puku-agent-sdk';
import { getDemoOptions } from './config.js';

/**
 * Demo 4: Custom In-Process Tools
 *
 * Demonstrates how to define a custom tool using `tool(...)` and
 * expose it to Puku AI using `createSdkMcpServer(...)`.
 */
async function runCustomToolsDemo() {
  console.log('--- [Demo 4] Custom In-Process Tools with Puku Agent SDK ---');

  // 1. Define custom tool: "calculateOrderDiscount"
  // Note: Pass raw Zod shape { ... }, not z.object({ ... })
  const calculateOrderDiscount = tool(
    'calculateOrderDiscount',
    'Calculates discount percentage and final price for a customer order',
    {
      customerTier: z.enum(['standard', 'silver', 'gold', 'vip']).describe('Customer loyalty tier'),
      orderAmountUSD: z.number().describe('Total order amount in USD'),
    },
    async ({ customerTier, orderAmountUSD }) => {
      console.log(`\n⚙️  [Tool Executing] calculateOrderDiscount(tier="${customerTier}", amount=$${orderAmountUSD})`);

      const discountMap: Record<string, number> = {
        standard: 0.05,
        silver: 0.1,
        gold: 0.15,
        vip: 0.25,
      };

      const rate = discountMap[customerTier] ?? 0;
      const discountUSD = orderAmountUSD * rate;
      const finalPriceUSD = orderAmountUSD - discountUSD;

      const result = {
        tier: customerTier,
        originalPriceUSD: orderAmountUSD,
        discountPercentage: `${rate * 100}%`,
        discountUSD,
        finalPriceUSD,
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // 2. Wrap tool in an SDK-managed in-process MCP server
  const server = createSdkMcpServer({
    name: 'orderService',
    tools: [calculateOrderDiscount as any],
  });

  const prompt = 'A VIP customer wants to purchase an item costing $450. Use the calculateOrderDiscount tool to calculate their final price and explain the savings.';
  console.log(`\nUser prompt: "${prompt}"\n`);
  console.log('Sending request to Puku Agent...\n');

  // 3. Pass server in mcpServers and allow the tool
  const stream = query({
    prompt,
    options: getDemoOptions({
      mcpServers: {
        orderService: server,
      },
      allowedTools: ['mcp__orderService__calculateOrderDiscount'],
    }),
  });

  for await (const message of stream) {
    if (message.type === 'assistant') {
      for (const item of message.message.content) {
        const block = item as { type: string; text?: string };
        if (block.type === 'text' && block.text) {
          console.log('\nAssistant response:\n');
          console.log(block.text);
        }
      }
    } else if (message.type === 'result') {
      console.log('\n----------------------------------------');
      console.log(`Execution status: ${message.subtype}`);
      console.log(`Turns:            ${message.num_turns}`);
      console.log(`Duration:         ${message.duration_ms} ms`);
      console.log('----------------------------------------\n');
      break;
    }
  }

  process.exit(0);
}

runCustomToolsDemo().catch((err) => {
  console.error('Custom tools demo error:', err);
  process.exit(1);
});
