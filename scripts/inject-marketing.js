#!/usr/bin/env node
/**
 * Escola Liberal — Inject Marketing Components into Existing Blog Articles
 *
 * Adds <link> to blog-marketing.css and <script> for blog-marketing.js
 * to all existing .html files in /blog/ directory.
 *
 * Safe to run multiple times (idempotent — checks before injecting).
 *
 * Usage: node scripts/inject-marketing.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.resolve(__dirname, '..', 'blog');
const dryRun = process.argv.includes('--dry-run');

// Files to inject
const CSS_TAG = '<link rel="stylesheet" href="../blog-marketing.css">';
const JS_TAG = '<script src="../blog-marketing.js" defer><\/script>';

// Markers to check idempotency
const CSS_MARKER = 'blog-marketing.css';
const JS_MARKER = 'blog-marketing.js';

function processFile(filePath) {
  const filename = path.basename(filePath);
  let html = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Skip non-article files
  if (filename === 'keywords.json' || filename.startsWith('.')) return null;

  // 1. Inject CSS before </head>
  if (!html.includes(CSS_MARKER)) {
    html = html.replace('</head>', `${CSS_TAG}\n</head>`);
    modified = true;
  }

  // 2. Inject JS before </body>
  if (!html.includes(JS_MARKER)) {
    html = html.replace('</body>', `${JS_TAG}\n</body>`);
    modified = true;
  }

  if (!modified) return 'skip';

  if (!dryRun) {
    fs.writeFileSync(filePath, html, 'utf8');
  }
  return 'ok';
}

function main() {
  console.log('Escola Liberal — Inject Marketing Components');
  console.log(`Modo: ${dryRun ? 'DRY RUN' : 'PRODUCAO'}\n`);

  const files = fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(BLOG_DIR, f));

  let injected = 0;
  let skipped = 0;

  for (const file of files) {
    const result = processFile(file);
    const name = path.basename(file);
    if (result === 'ok') {
      console.log(`  ✓ ${name}`);
      injected++;
    } else if (result === 'skip') {
      console.log(`  — ${name} (ja tem marketing)`);
      skipped++;
    }
  }

  console.log(`\n${injected} artigos atualizados | ${skipped} ja tinham | ${files.length} total`);
  if (dryRun) console.log('(DRY RUN — nada foi salvo)');
}

main();
