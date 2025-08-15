/// <reference types="vitest/config" />
import path from "path";
import {
  defineConfig 
} from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";


// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: path.resolve(__dirname, "tsconfig.json"),
      // Generate .d.ts into dist/ and add a "types" entry for the package root
      insertTypesEntry: true,
      outDir: "dist",
      include: ["src"],
      rollupTypes: true, 
      exclude: ["**/*.test.*", "**/__tests__/**"]
    })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "ReactSimpleSignature",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs")
    },
    rollupOptions: {
      output: {
        exports: "named" 
      },
      // mark peer deps as external so they’re not bundled
      external: ["react", "react-dom"]
    },
    sourcemap: true,
    target: "es2019",
    // Keep JSX as runtime calls; fine for libs
    // (Vite/ESBuild handles this via the React plugin)
    minify: false
  },
  test: {
    projects: [{
      extends: true,
      test: {
        setupFiles: ['./vitest.setup.ts'],
        environment: 'jsdom',
        deps: {
          // vitest < 0.34
          inline: ['vitest-canvas-mock'],
          // >= 0.34
          optimizer: {
            web: {
              include: ['vitest-canvas-mock']
            }
          }
        },
        // For this config, check https://github.com/vitest-dev/vitest/issues/740
        // Vitest < 0.1.x
        // threads: false,
        // >= 0.1.0
        poolOptions: {
          threads: {
            singleThread: true,
          },
        },
        environmentOptions: {
          jsdom: {
            resources: 'usable',
          },
        },
      },
    }
    ]
  }
});