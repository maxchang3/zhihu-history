/// <reference types="vite/client" />
/// <reference types="vite-plugin-monkey/client" />
//// <reference types="vite-plugin-monkey/global" />

import type * as _React from 'react'
import type * as _ReactDOM from 'react-dom'

declare global {
    const React: typeof _React
    const ReactDOM: typeof _ReactDOM
}
