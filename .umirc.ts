import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'RForm',
  favicon:
    '/logo.svg',
  logo:
    '/logo.svg',
  
  outputPath: '.doc',
  exportStatic: {},
  base:"/RForm",
  publicPath:"/RForm/",
  styles: [
    `
      .markdown table {
        width: auto !important;
      }
    `,
  ]
});