#!/usr/bin/env node
import 'dotenv/config';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Helpers ---------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readImageAsDataUrl(localPath) {
  const abs = path.isAbsolute(localPath) ? localPath : path.join(__dirname, localPath);
  const data = fs.readFileSync(abs);
  const b64 = data.toString('base64');
  // crude mime guess
  const ext = path.extname(abs).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'application/octet-stream';
  return `data:${mime};base64,${b64}`;
}

// --- Config ----------------------------------------------------------------
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.MODEL || 'gpt-4o-mini';
const DRY_RUN = process.env.DRY_RUN === '1';

// Initialize client only if we have a key (not needed for DRY_RUN)
let client = null;
if (apiKey) {
  client = new OpenAI({ apiKey });
}


// --- Accept argument for image file path or URL ---
const imageArg = process.argv[2];
let imageUrl;
if (!imageArg) {
  // Default to remote image if no argument provided
  imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Fronalpstock_big.jpg/640px-Fronalpstock_big.jpg';
} else if (/^https?:\/\//i.test(imageArg)) {
  // If argument is a URL, use as is
  imageUrl = imageArg;
} else {
  // Otherwise, treat as local file path
  try {
    imageUrl = readImageAsDataUrl(imageArg);
  } catch (e) {
    console.error('Error reading image:', e.message);
    process.exit(1);
  }
}

const userPrompt = 'Please describe this image in one concise paragraph and list any text found.';

const contentParts = [
  { type: 'text', text: userPrompt },
  { type: 'image_url', image_url: { url: imageUrl } },
];

async function run() {
  const payload = {
    model,
    messages: [
      {
        role: 'user',
        content: contentParts,
      },
    ],
  };

  if (DRY_RUN) {
    console.log('DRY_RUN=1 -> printing payload without sending request');
    console.dir(payload, { depth: null });
    return;
  }

  if (!apiKey) {
    console.error('Missing OPENAI_API_KEY in environment. Copy .env.example to .env and set your key.');
    process.exit(1);
  }

  try {
    const response = await client.chat.completions.create(payload);
    const text = response.choices?.[0]?.message?.content || '(no content)';
    console.log('\n--- Response ---');
    console.log(text);
  } catch (err) {
    console.error('OpenAI API error:', err.response?.data || err.message || err);
    process.exitCode = 1;
  }
}

run();
