import { GM_registerMenuCommand } from '$'
import { DEFAULT_HISTORY_LIMIT, HISTORY_LIMIT, clearHistory, setHistoryLimit } from '@/utils/history'

type MenuCommand = Parameters<typeof GM_registerMenuCommand>

const clearHistoryCommand: MenuCommand = [
    '🗑 清空浏览历史记录',
    () => {
        clearHistory()
        alert('清空浏览历史成功')
    },
]

const setHistoryLimitCommand: MenuCommand = [
    `🔢 设置记录数量限制（当前：${HISTORY_LIMIT}）`,
    () => {
        const input = prompt(`请输入新的历史记录最大数量（默认 ${DEFAULT_HISTORY_LIMIT}）`)
        if (!input) return
        const [isOK, message] = setHistoryLimit(input)
        if (isOK) {
            alert('设置成功')
        } else {
            alert(message)
        }
    },
]

export const registerMenuCommands = () => {
    Reflect.apply(GM_registerMenuCommand, null, clearHistoryCommand)
    Reflect.apply(GM_registerMenuCommand, null, setHistoryLimitCommand)
}
