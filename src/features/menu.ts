import { GM_registerMenuCommand } from '$'
import {
    DEFAULT_HISTORY_LIMIT,
    HISTORY_LIMIT,
    clearHistory,
    getHistory,
    importHistory,
    setHistoryLimit,
} from './storage'

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
    `🔢 设置数量限制（当前：${HISTORY_LIMIT}）`,
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

const exportDataCommand: MenuCommand = [
    '📤 导出历史记录',
    () => {
        const history = getHistory()
        const blob = new Blob([JSON.stringify(history)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'zhihu_history.json'
        a.click()
        URL.revokeObjectURL(url)
    },
]

const importDataCommand: MenuCommand = [
    '📂 导入历史记录',
    () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = (e) => {
                const content = e.target?.result
                if (typeof content !== 'string') return

                const merge = confirm(
                    '⚠️危险操作 - 是否合并数据：\n\n' +
                        '• 点击"确定"：合并数据（注意：超出限制的项将被删除）\n' +
                        '• 点击"取消"：覆盖现有数据\n' +
                        '📋 建议先导出备份您的历史记录！'
                )
                alert(
                    importHistory(content, merge).match({
                        Ok: (msg) => `导入成功: ${msg}`,
                        Err: (error) => `导入失败: ${error}`,
                    })
                )
            }
            reader.readAsText(file)
        }
        input.click()
    },
]

const registerMenuCommand = (command: MenuCommand) => GM_registerMenuCommand(...command)

export const registerMenuCommands = () =>
    [clearHistoryCommand, setHistoryLimitCommand, exportDataCommand, importDataCommand].forEach(registerMenuCommand)
