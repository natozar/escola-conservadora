import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, cpSync } from 'fs';
import { minify } from 'terser';

// Collect all HTML entry points
const htmlFiles = readdirSync('.').filter(f => f.endsWith('.html'));
const input = {};
htmlFiles.forEach(f => { input[f.replace('.html', '')] = resolve(__dirname, f); });

// Plugin to minify standalone JS files (non-module scripts) and copy static assets
function minifyLegacyJS() {
  return {
    name: 'minify-legacy-js',
    closeBundle: async () => {
      const jsFiles = ['app.js', 'i18n.js', 'cookie-consent.js', 'supabase-client.js', 'stripe-billing.js'];
      for (const file of jsFiles) {
        if (!existsSync(file)) continue;
        const code = readFileSync(file, 'utf8');
        const result = await minify(code, {
          compress: { passes: 2, drop_console: false },
          format: { comments: false },
          mangle: true
        });
        writeFileSync(resolve('dist', file), result.code);
        const saved = Math.round((1 - result.code.length / code.length) * 100);
        console.log(`  ✓ ${file}: ${Math.round(code.length/1024)}KB → ${Math.round(result.code.length/1024)}KB (-${saved}%)`);
      }

      // Copy static assets that Vite doesn't handle
      const staticDirs = ['lessons', 'assets', 'supabase'];
      for (const dir of staticDirs) {
        if (existsSync(dir)) {
          cpSync(dir, resolve('dist', dir), { recursive: true });
          console.log(`  ✓ Copied ${dir}/`);
        }
      }

      // Copy lessons.json (fallback) and sw.js (can't minify due to template literals)
      for (const f of ['lessons.json', 'sw.js']) {
        if (existsSync(f)) cpSync(f, resolve('dist', f));
      }
    }
  };
}

export default defineConfig({
  base: '/escola-liberal/',
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
    }
  },
  plugins: [minifyLegacyJS()],
  server: {
    open: '/app.html',
    port: 3000
  }
});
