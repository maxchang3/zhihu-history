import { GM_getValue, GM_setValue } from '$'
import { logger } from '@/utils/logger'

export interface ZhihuContent {
    authorName: string
    itemId: number
    title: string
    type: 'answer' | 'article'
    url?: string
    timestamp?: number
}

const STORAGE_KEY = 'ZH_HISTORY'
const HISTORY_LIMIT_KEY = 'HISTORY_LIMIT'

export const DEFAULT_HISTORY_LIMIT = 20
export const HISTORY_LIMIT = GM_getValue(HISTORY_LIMIT_KEY) || DEFAULT_HISTORY_LIMIT

export const setHistoryLimit = (limit: string): [isOK: true, message: null] | [isOK: false, message: string] => {
    const numericLimit = Number(limit)
    if (!Number.isNaN(numericLimit) && numericLimit > 0) {
        GM_setValue(HISTORY_LIMIT_KEY, numericLimit)
        return [true, null]
    }
    return [false, '输入无效，请输入一个正整数']
}

export const saveHistory = (item: ZhihuContent) => {
    try {
        const raw = GM_getValue(STORAGE_KEY)
        const historyItems: ZhihuContent[] = raw ? JSON.parse(raw) : []

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
    } catch (error) {
        logger.error('保存浏览历史失败:', error)
    }
}

/**
 * 将旧的 localStorage 数据迁移到用户脚本管理器的存储中
 */
const migrateToGMStorage = () => {
    try {
        logger.log('检测到旧的浏览历史数据，正在转换...')
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            GM_setValue(STORAGE_KEY, raw)
            localStorage.removeItem(STORAGE_KEY)
        }
        logger.log('转换浏览历史数据成功')
    } catch (error) {
        logger.error('转换浏览历史失败:', error)
    }
}

export const getHistory = (): ZhihuContent[] => {
    try {
        if (localStorage.getItem(STORAGE_KEY) !== null) {
            migrateToGMStorage()
        }
        const raw = GM_getValue(STORAGE_KEY)
        return raw ? JSON.parse(raw) : []
    } catch (error) {
        logger.error('获取浏览历史失败:', error)
        return []
    }
}

/**
 * 清空浏览历史
 */
export const clearHistory = () => {
    try {
        GM_setValue(STORAGE_KEY, null)
    } catch (error) {
        logger.error('清空浏览历史失败:', error)
    }
}

/**
 * 从 DOM 元素中提取历史记录信息并保存
 */
const saveHistoryFromElement = (item: HTMLElement) => {
    const zop = item.dataset.zop
    if (!zop) {
        logger.error('无法读取回答或文章信息', item.dataset)
        return
    }
    try {
        const data: ZhihuContent = JSON.parse(zop)
        const link = item.querySelector<HTMLAnchorElement>('.ContentItem-title a')
        if (link) data.url = link.href
        saveHistory(data)
    } catch (err) {
        logger.error('解析历史记录失败:', err)
    }
}

/**
 * 监听点击事件，保存浏览历史
 */
export const trackHistory = () => {
    // 选择整个 TopstoryContent，当 tab 切换时，内容会被替换
    const container = document.querySelector('#TopstoryContent')

    if (!container) {
        logger.error('未找到首页推荐容器')
        return
    }

    container.addEventListener('click', (e) => {
        const target = e.target
        if (!(target instanceof HTMLElement)) return
        const item = target.closest<HTMLElement>('.ContentItem')
        if (item) saveHistoryFromElement(item)
    })
}
