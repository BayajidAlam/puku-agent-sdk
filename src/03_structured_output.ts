import { query, type Options } from 'puku-agent-sdk';
import { getDemoOptions } from './config.js';

export type JsonSchemaOutputFormat = {
  type: 'json_schema';
  schema: Record<string, any>;
};

/**
 * Demo 3: Structured JSON Output using JSON Schema
 *
 * Demonstrates extracting validated, strongly-typed structured JSON
 * from natural language using Puku Agent SDK.
 */
async function runStructuredOutputDemo() {
  console.log('--- [Demo 3] Structured JSON Output with Puku Agent SDK ---');

  // Define the JSON schema for the data to extract
  const contactSchema: JsonSchemaOutputFormat = {
    type: 'json_schema',
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string', description: 'Full name of person' },
        role: { type: 'string', description: 'Job title / role' },
        company: { type: 'string', description: 'Company name' },
        skills: {
          type: 'array',
          items: { type: 'string' },
          description: 'Technical skills mentioned',
        },
        yearsOfExperience: {
          type: 'integer',
          description: 'Years of professional experience',
        },
      },
      required: ['fullName', 'role', 'company', 'skills'],
      additionalProperties: false,
    },
  };

  const rawText = `
    Hi, I am Sarah Jenkins. I currently work as a Senior Full Stack Engineer at
    TechVanguard Solutions. Over the past 7 years in tech, I specialize heavily
    in TypeScript, Node.js, GraphQL, and Distributed Systems.
  `;

  console.log('Input Text to parse:\n', rawText.trim());
  console.log('\nRequesting structured extraction matching schema...\n');

  const stream = query({
    prompt: `Extract the profile information from the text below. Return ONLY a valid JSON object conforming to the JSON schema, with no markdown codeblocks, no explanations, and no preamble:\n\n${rawText}`,
    options: getDemoOptions({
      outputFormat: contactSchema,
    }),
  });

  let structuredResult: any = null;

  try {
    for await (const message of stream) {
      if (message.type === 'result') {
        if (message.structured_output) {
          structuredResult = message.structured_output;
        }

        console.log('Extracted Structured JSON Result:');
        console.log(JSON.stringify(structuredResult, null, 2));

        console.log('\n----------------------------------------');
        console.log(`Execution status: ${message.subtype}`);
        console.log(`Turns:            ${message.num_turns}`);
        console.log(`Duration:         ${message.duration_ms} ms`);
        console.log('----------------------------------------\n');
        break;
      }
    }
  } catch (err: any) {
    if (err.name === 'JsonSchemaValidationError') {
      console.log('SDK caught JsonSchemaValidationError from LLM response.');
      console.log('Raw output from model:');
      console.log(err.rawText);
    } else {
      throw err;
    }
  }

  process.exit(0);
}

runStructuredOutputDemo().catch((err) => {
  console.error('Structured output demo error:', err);
  process.exit(1);
});
