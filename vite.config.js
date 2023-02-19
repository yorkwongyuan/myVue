import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: './lib/Vue/index.js',
      name: 'Counter',
      fileName: 'counter'
    }
  },
  css: {
    postcss: {}
  }
})
