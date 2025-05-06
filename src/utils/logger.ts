import { GM_info } from '$'

type LogLevel = 'log' | 'error' | 'warn'

const log = (logMethod: LogLevel, tag: string, ...args: unknown[]) => {
    const colors = {
        log: '#2c3e50',
        error: '#ff4500',
        warn: '#f39c12',
    }
    const fontFamily =
        "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;"

    console[logMethod](
        `%c ${GM_info.script.name} %c ${tag} `,
        `padding: 2px 6px; border-radius: 3px 0 0 3px; color: #fff; background: #056de8; font-weight: bold; ${fontFamily}`,
        `padding: 2px 6px; border-radius: 0 3px 3px 0; color: #fff; background: ${colors[logMethod]}; font-weight: bold; ${fontFamily}`,
        ...args
    )
}

export const logger: Record<LogLevel, (...args: unknown[]) => void> = {
    log: (...args) => log('log', '日志', ...args),
    error: (...args) => log('error', '错误', ...args),
    warn: (...args) => log('warn', '警告', ...args),
}
