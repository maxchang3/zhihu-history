import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: [
            {
                find: '@',
                replacement: fileURLToPath(new URL('./src', import.meta.url)),
            },
        ],
    },
    plugins: [
        react(),
        monkey({
            entry: 'src/main.tsx',
            userscript: {
                name: '知乎历史记录',
                author: 'Max Chang',
                icon: 'https://static.zhihu.com/heifetz/favicon.ico',
                namespace: 'https://maxchang.me',
                match: ['https://www.zhihu.com/', 'https://www.zhihu.com/search*'],
                license: 'MIT',
                grant: ['unsafeWindow'],
            },
            build: {
                externalGlobals: {
                    react: 'unsafeWindow.React',
                    'react-dom': 'unsafeWindow.ReactDOM',
                },
            },
        }),
    ],
})
