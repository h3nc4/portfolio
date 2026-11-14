import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

// React renders the icon components to static SVG at build time and ships nothing.
// The stylesheet is inlined, so the first paint waits on no request but the page.
export default defineConfig({
  site: 'https://h3nc4.com',
  integrations: [react()],
  build: {
    assets: 'assets',
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
