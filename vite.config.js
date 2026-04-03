import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, cpSync, copyFileSync } from 'fs';
import { execSync } from 'child_process';
import { minify } from 'terser';

// Collect HTML entry points (exclude admin panels from public deploy)
const EXCLUDE_HTML = ['admin-stripe.html', 'admin-stripe-MSI.html'];
const htmlFiles = readdirSync('.').filter(f => f.endsWith('.html') && !EXCLUDE_HTML.includes(f));
const input = {};
htmlFiles.forEach(f => { input[f.replace('.html', '')] = resolve(__dirname, f); });

// Plugin to minify standalone JS files (non-module scripts) and copy static assets
function minifyLegacyJS() {
  return {
    name: 'minify-legacy-js',
    writeBundle: async () => {
      const root = __dirname;
      console.log('  [plugin] writeBundle running, root:', root);
      const dist = resolve(root, 'dist');
      // app.js removed — now bundled as ES modules via src/main.js (Vite handles it)
      const jsFiles = ['i18n.js', 'cookie-consent.js', 'supabase-client.js', 'stripe-billing.js'];
      for (const file of jsFiles) {
        const src = resolve(root, file);
        if (!existsSync(src)) continue;
        const code = readFileSync(src, 'utf8');
        const result = await minify(code, {
          compress: { passes: 2, drop_console: false },
          format: { comments: false },
          mangle: true
        });
        writeFileSync(resolve(dist, file), result.code);
        const saved = Math.round((1 - result.code.length / code.length) * 100);
        console.log(`  ✓ ${file}: ${Math.round(code.length/1024)}KB → ${Math.round(result.code.length/1024)}KB (-${saved}%)`);
      }

      console.log('  [plugin] Copying static assets...');
      // Use shell commands to copy (avoids Node cpSync issues with accented paths on Windows)
      try {
        execSync(`xcopy /E /I /Y /Q "${resolve(root, 'lessons')}" "${resolve(dist, 'lessons')}"`, { stdio: 'pipe' });
        console.log('  ✓ Copied lessons/');
      } catch(e) { console.error('  ✗ lessons:', e.message); }
      try {
        execSync(`xcopy /E /I /Y /Q "${resolve(root, 'assets')}" "${resolve(dist, 'assets')}"`, { stdio: 'pipe' });
        console.log('  ✓ Copied assets/');
      } catch(e) { console.error('  ✗ assets:', e.message); }
      // supabase/ NOT copied to dist (migrations/functions are not public assets)
      try {
        execSync(`xcopy /E /I /Y /Q "${resolve(root, 'blog')}" "${resolve(dist, 'blog')}"`, { stdio: 'pipe' });
        console.log('  ✓ Copied blog/');
      } catch(e) { console.error('  ✗ blog:', e.message); }

      // Copy individual files
      for (const f of ['lessons.json', 'sw.js', 'CNAME', 'robots.txt', 'sitemap.xml']) {
        const src = resolve(root, f);
        if (existsSync(src)) {
          try { execSync(`copy /Y "${src}" "${resolve(dist, f)}"`, { stdio: 'pipe' }); console.log(`  ✓ Copied ${f}`); }
          catch(e) { console.error(`  ✗ ${f}:`, e.message); }
        }
      }
    }
  };
}

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: { input },
    assetsDir: 'assets/build',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: false, passes: 2 },
      format: { comments: false }
    },
    cssMinify: 'lightningcss',
    reportCompressedSize: true,
  },
  css: {
    devSourcemap: false,
  },
  plugins: [minifyLegacyJS()],
  server: {
    open: '/app.html',
    port: 3000
  }
});
