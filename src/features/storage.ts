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
export const getHistory = () =>
    Result.try(() => {
        if (localStorage.getItem(STORAGE_KEY) !== null) {
            const migrationResult = migrateToGMStorage()
            migrationResult.mapErr((error) => {
                logger.error('历史记录转换失败：', error)
            })
        }
        const raw = GM_getValue(STORAGE_KEY)
        return (raw ? JSON.parse(raw).reverse() : []) as ZhihuMetadata[]
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
