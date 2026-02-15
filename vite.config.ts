import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import unocss from 'unocss/vite'
import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'
import packageJson from './package.json'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const isMinBuild = mode === 'min'
    return {
        resolve: {
            alias: [
                {
                    find: '@',
                    replacement: fileURLToPath(new URL('./src', import.meta.url)),
                },
            ],
        },
        build: {
            minify: isMinBuild,
            emptyOutDir: false,
        },
        plugins: [
            // https://unocss.dev/integrations/vite#react
            react({
                jsxRuntime: 'classic',
            }),
            unocss(),
            monkey({
                entry: 'src/main.tsx',
                userscript: {
                    name: '知乎历史记录 - 全局面板',
                    description: '在全局面板中浏览、搜索和管理你的知乎最近浏览记录。',
                    author: 'Max Chang',
                    icon: 'https://static.zhihu.com/heifetz/favicon.ico',
                    namespace: 'https://maxchang.me',
                    match: [
                        'https://www.zhihu.com/',
                        'https://www.zhihu.com/follow*',
                        'https://www.zhihu.com/hot*',
                        'https://www.zhihu.com/column-square*',
                        'https://www.zhihu.com/search?*',
                        'https://www.zhihu.com/topic/*',
                        'https://www.zhihu.com/question/*/answer/*',
                    ],
                    license: 'MIT',
                    grant: ['unsafeWindow'],
                },
                build: {
                    externalGlobals: {
                        // react and react-dom are already mounted on the page
                        react: 'unsafeWindow.React',
                        'react-dom': 'unsafeWindow.ReactDOM',
                    },
                    fileName: `${packageJson.name ?? 'monkey'}${isMinBuild ? '.min' : ''}.user.js`,
                },
            }),
        ],
    }
})
