import { defineConfig } from 'tsup';
import { copyFileSync } from 'fs';

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
  // No CSS modules — plain CSS exported separately
  async onSuccess() {
    try {
      copyFileSync('src/styles/mandoo.css', 'dist/styles.css');
      console.log('✓ dist/styles.css ready');
    } catch (e) {
      console.warn('CSS copy failed:', e);
    }
  },
});
