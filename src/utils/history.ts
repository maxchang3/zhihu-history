import { GM_getValue, GM_setValue } from '$'
import { logger } from '@/utils/logger'
import { Result } from '@/utils/result'

/**
 * - `answer` - 回答
 * - `article` - 文章
 * - `pin` - 想法
 */
type ZhihuContentType = 'answer' | 'article' | 'pin'

export interface ZhihuContent {
    authorName: string
    itemId: number
    title: string
    type: ZhihuContentType
    url?: string
    visitTime?: number
    content?: string
}

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

export const saveHistory = (item: ZhihuContent) =>
    Result.try(() => {
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
    })

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
        return (raw ? JSON.parse(raw).reverse() : []) as ZhihuContent[]
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

const augmentContent = (item: HTMLElement, rawContent: ZhihuContent): ZhihuContent => {
    rawContent.visitTime = Date.now()
    const extractContent = (): string | undefined => {
        const span = item.querySelector<HTMLSpanElement>('.RichText')
        if (!span) return undefined
        let text = span.innerText.trim()
        /**
         * 如果获取到的内容不包含作者名称，则手动添加作者前缀
         * 这通常发生在回答正好被展开的情况下，此时获取的是不包括作者名的正文
         */
        if (!text.startsWith(rawContent.authorName)) text = `${rawContent.authorName}：${text}`
        return text.length > 120 ? `${text.slice(0, 120)}...` : text
    }
    switch (rawContent.type) {
        case 'pin': {
            const userLink = item.closest('.Feed')?.querySelector<HTMLAnchorElement>('.UserLink-link')
            if (userLink) rawContent.authorName = userLink.innerText.trim()
            rawContent.url = `https://www.zhihu.com/pin/${rawContent.itemId}`
            break
        }

        case 'article':
        case 'answer': {
            const link = item.querySelector<HTMLAnchorElement>('.ContentItem-title a')
            if (link) rawContent.url = link.href
            rawContent.content = extractContent()
            break
        }
    }
    return rawContent
}

/**
 * 从 DOM 元素中提取历史记录信息并保存
 */
export const saveHistoryFromElement = (item: HTMLElement): Result<null, string> => {
    const zop = item.dataset.zop
    if (!zop) return Result.Err(`无法读取回答或文章信息：${JSON.stringify(item.dataset)}`)
    return Result.try(() => JSON.parse(zop) as ZhihuContent)
        .map((data) => augmentContent(item, data))
        .andThen(saveHistory)
        .mapErr((err) => `保存浏览历史失败: ${err}`)
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
        if (!item) return
        saveHistoryFromElement(item).mapErr((err) => logger.error(err))
    })
}
