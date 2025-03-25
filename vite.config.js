import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  assetsInclude: ['**/*.glb'],
  plugins: [
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
            src: 'gltf/*',
            dest: 'gltf'
          },
          {
            src: 'audio/*',
            dest: 'audio'
          },
          {
            src: 'hdri/*',
            dest: 'hdri'
          },
          {
            src: 'texture/*',
            dest: 'texture'
          },
          {
            src: 'decoder/*',
            dest: 'decoder'
          },
          {
            src: 'product/*',
            dest: 'product'
          },
          {
            src: 'style/*',
            dest: 'style'
          }
      ]
    })
  ],
  base : '/indehell/'
});
