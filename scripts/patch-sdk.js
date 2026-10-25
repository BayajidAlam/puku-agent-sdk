import fs from 'node:fs';
import path from 'node:path';

const sdkPath = path.resolve('node_modules', 'puku-agent-sdk', 'sdk.mjs');

if (fs.existsSync(sdkPath)) {
  let content = fs.readFileSync(sdkPath, 'utf8');
  const target = 'G.push("--json-schema",JSON.stringify(Q.outputFormat.schema)),G.push("--output-format","json");';
  const replacement = 'G.push("--json-schema",JSON.stringify(Q.outputFormat.schema));';

  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(sdkPath, content, 'utf8');
    console.log('[postinstall] Applied json_schema output fix to puku-agent-sdk.');
  }
}
