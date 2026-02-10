/// <reference types="vite/client" />
/// <reference types="vite-plugin-monkey/client" />
//// <reference types="vite-plugin-monkey/global" />

import type { AttributifyAttributes } from '@unocss/preset-attributify'

declare module 'react' {
    interface HTMLAttributes<T> extends AttributifyAttributes {}
}
