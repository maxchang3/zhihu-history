import { GM_registerMenuCommand } from '$'
import { DEFAULT_HISTORY_LIMIT, HISTORY_LIMIT, clearHistory, setHistoryLimit } from './storage'

type MenuCommand = Parameters<typeof GM_registerMenuCommand>

const clearHistoryCommand: MenuCommand = [
    '🗑 清空浏览历史记录',
    () => {
        alert(
            clearHistory().match({
                Ok: () => '清空成功',
                Err: (error) => `清空失败: ${error}`,
            })
        )
    },
]

const setHistoryLimitCommand: MenuCommand = [
    `🔢 设置记录数量限制（当前：${HISTORY_LIMIT}）`,
    () => {
        const input = prompt(`请输入新的历史记录最大数量（默认 ${DEFAULT_HISTORY_LIMIT}）`)
        if (!input) return
        alert(
            setHistoryLimit(input).match({
                Ok: () => '设置成功',
                Err: (error) => `设置失败: ${error}`,
            })
        )
    },
]

export const registerMenuCommands = () => {
    Reflect.apply(GM_registerMenuCommand, null, clearHistoryCommand)
    Reflect.apply(GM_registerMenuCommand, null, setHistoryLimitCommand)
}
