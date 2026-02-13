import { defineConfig, presetMini, transformerDirectives, transformerVariantGroup } from 'unocss'

export default defineConfig({
    shortcuts: {
        btn: `
            p-(x-2 y-1) rounded text-sm flex items-center gap-1
            border transition-all cursor-pointer
            text-gray-900 border-gray-300 bg-transparent
            hover:(bg-blue-50 text-blue-500 border-blue-500)
            focus:(outline-none ring-2 ring-blue-500 dark:ring-blue-400)
            disabled:(cursor-not-allowed opacity-50)
            dark:(text-gray-100 border-gray-600 hover:(bg-blue-900/20 text-blue-400 border-blue-400))
        `,
        'custom-scrollbar': `
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-gray-300/50
            [&::-webkit-scrollbar-thumb]:rd-full
            hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
            dark:[&::-webkit-scrollbar-thumb]:bg-gray-600/50
            dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-500
            `,
        'text-primary': 'text-gray-900 dark:text-gray-100',
        'text-secondary': 'text-gray-500 dark:text-gray-400',
        'border-base': 'border border-solid border-gray-200 dark:border-gray-700',
        'border-b-base': 'border-b border-b-solid border-gray-200 dark:border-gray-700',
        'border-t-base': 'border-t border-t-solid border-gray-200 dark:border-gray-700',
        'bg-highlight': 'bg-blue-50 dark:bg-blue-900/20',
    },
    rules: [['object-contain', { 'object-fit': 'contain' }]],
    presets: [
        presetMini({
            dark: 'media',
        }),
    ],
    transformers: [transformerDirectives(), transformerVariantGroup()],
})
