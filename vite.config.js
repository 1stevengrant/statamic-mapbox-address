import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [vue()],
    build: {
        outDir: 'dist/js',
        lib: {
            entry: 'resources/js/address.js',
            name: 'StatamicMapboxAddress',
            fileName: () => 'address.js',
            formats: ['iife']
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                globals: {
                    vue: 'Vue'
                }
            }
        }
    }
});
