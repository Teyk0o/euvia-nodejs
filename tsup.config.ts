import { defineConfig } from 'tsup';

export default defineConfig([
  // Client bundle (React components)
  {
    entry: {
      index: 'src/client/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    minify: false,
    external: ['react', 'react-dom', 'socket.io-client'],
    outDir: 'dist',
    esbuildOptions(options) {
      options.banner = {
        js: '"use client";',
      };
    },
  },
  // Server bundle
  {
    entry: {
      server: 'src/server/index.ts',
      cli: 'src/server/cli.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: false,
    splitting: false,
    platform: 'node',
    target: 'node20',
    outDir: 'dist',
  },
]);
