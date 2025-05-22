import { GM_getValue, GM_setValue } from '$'
import type { ZhihuMetadata } from '@/types'
import { logger } from '@/utils/logger'
import { Result } from '@/utils/result'

const STORAGE_KEY = 'ZH_HISTORY'
const HISTORY_LIMIT_KEY = 'HISTORY_LIMIT'

export const DEFAULT_HISTORY_LIMIT = 20
export const HISTORY_LIMIT = GM_getValue(HISTORY_LIMIT_KEY) || DEFAULT_HISTORY_LIMIT

export const setHistoryLimit = (limit: string): Result<null, string> => {
    const numericLimit = Number(limit)
    if (!Number.isNaN(numericLimit) && numericLimit > 0) {
        GM_setValue(HISTORY_LIMIT_KEY, numericLimit)
        return Result.Ok(null)
    }
    return Result.Err('输入无效，请输入一个正整数')
}

export const saveHistory = (item: ZhihuMetadata) =>
    Result.try(() => {
        const raw = GM_getValue(STORAGE_KEY)
        const historyItems: ZhihuMetadata[] = raw ? JSON.parse(raw) : []

        // 检查是否存在重复项，如果有则删除旧的
        const existingIndex = historyItems.findIndex((i) => i.itemId === item.itemId)
        if (existingIndex !== -1) {
            historyItems.splice(existingIndex, 1)
        }

        historyItems.push(item)

        if (historyItems.length > HISTORY_LIMIT) {
            historyItems.splice(0, historyItems.length - HISTORY_LIMIT)
        }

        GM_setValue(STORAGE_KEY, JSON.stringify(historyItems))
    }).mapErr((error) => `保存浏览历史失败：${error}`)

export const importHistory = (history: string, merge = false) => {
    const parsedHistory = Result.try(() => JSON.parse(history) as ZhihuMetadata[])
        .unwrapOr([])
        .reverse()

    if (!Array.isArray(parsedHistory) || parsedHistory.length === 0) {
        return Result.Err('导入的历史记录格式不正确或为空数组')
    }

    let historyItems: ZhihuMetadata[] = getHistory(false)
    let mergeCount = 0
    if (merge) {
        parsedHistory.forEach((item) => {
            const existingIndex = historyItems.findIndex((i) => i.itemId === item.itemId)
            if (existingIndex !== -1) {
                historyItems.splice(existingIndex, 1)
                mergeCount++
            }
            historyItems.push(item)
        })
    } else {
        historyItems = parsedHistory
    }

    if (historyItems.length > HISTORY_LIMIT) {
        historyItems.splice(0, historyItems.length - HISTORY_LIMIT)
    }

    historyItems.sort((a, b) => (a.visitTime || 0) - (b.visitTime || 0))

    GM_setValue(STORAGE_KEY, JSON.stringify(historyItems))

    return Result.Ok(
        `成功导入 ${parsedHistory.length} 条历史记录` + (mergeCount > 0 ? `，合并了 ${mergeCount} 条重复记录` : '')
    )
}

/**
 * 将旧的 localStorage 数据迁移到用户脚本管理器的存储中
 */
const migrateToGMStorage = () =>
    Result.try(() => {
        logger.log('检测到旧的浏览历史数据，正在转换...')
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            GM_setValue(STORAGE_KEY, raw)
            localStorage.removeItem(STORAGE_KEY)
        }
        logger.log('转换浏览历史数据成功')
    })

/**
 * 获取浏览历史
 */
export const getHistory = (reverse = true) =>
    Result.try(() => {
        if (localStorage.getItem(STORAGE_KEY) !== null) {
            const migrationResult = migrateToGMStorage()
            migrationResult.mapErr((error) => {
                logger.error('历史记录转换失败：', error)
            })
        }
        const raw = GM_getValue(STORAGE_KEY)
        return (raw ? (reverse ? JSON.parse(raw).reverse() : JSON.parse(raw)) : []) as ZhihuMetadata[]
    }).match({
        Ok: (history) => history,
        Err: (error) => {
            logger.error('获取浏览历史失败：', error)
            return []
        },
    })

/**
 * 清空浏览历史
 */
export const clearHistory = (): Result<null, Error> =>
    Result.try(() => {
        GM_setValue(STORAGE_KEY, null)
    })
