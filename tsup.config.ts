import { defineConfig } from 'tsup';
import { copyFileSync, renameSync, existsSync } from 'fs';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: { resolve: true },
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: false,
  treeshake: true,
  external: ['react', 'react-dom', 'next'],
  // tsup processes CSS modules → outputs dist/index.css with correct hashed names
  async onSuccess() {
    // Rename the processed CSS to styles.css so users import '@mandoo/editor/styles'
    try {
      if (existsSync('dist/index.css')) {
        copyFileSync('dist/index.css', 'dist/styles.css');
        console.log('✓ dist/styles.css ready (processed CSS modules)');
      }
    } catch (e) {
      console.warn('CSS copy failed:', e);
    }
  },
});
