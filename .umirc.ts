import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'RForm',
  favicon:
    '/logo.svg',
  logo:
    '/logo.svg',
  
  outputPath: '.doc',
  exportStatic: {},
  styles: [
    `
      .markdown table {
        width: auto !important;
      }
    `,
  ]
});