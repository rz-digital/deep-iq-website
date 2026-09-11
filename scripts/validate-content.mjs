import Ajv from 'ajv';
import { readFile } from 'node:fs/promises';

const inputs = [
  [
    'page.json',
    new URL('../public/page.json', import.meta.url),
    new URL('../schemas/page.schema.json', import.meta.url),
  ],
  [
    'site-content.json',
    new URL('../public/site-content.json', import.meta.url),
    new URL('../schemas/site-content.schema.json', import.meta.url),
  ],
];

const ajv = new Ajv({ allErrors: true, strict: true });
let failed = false;

for (const [name, contentUrl, schemaUrl] of inputs) {
  try {
    const [content, schema] = await Promise.all([
      readFile(contentUrl, 'utf8').then(JSON.parse),
      readFile(schemaUrl, 'utf8').then(JSON.parse),
    ]);
    const validate = ajv.compile(schema);
    if (!validate(content)) {
      failed = true;
      console.error(`${name} is invalid:`);
      validate.errors?.forEach(({ instancePath, message }) => {
        console.error(`  ${instancePath || '/'} ${message || 'is invalid'}`);
      });
    } else {
      console.log(`Validated ${name}.`);
    }
  } catch (error) {
    failed = true;
    console.error(`Unable to validate ${name}:`, error);
  }
}

if (failed) process.exitCode = 1;
