import { GM_getValue, GM_setValue } from '$'
import { logger } from '@/utils/logger'
import { Result } from '@/utils/result'

// biome-ignore lint/suspicious/noExplicitAny: use for type guard
function isIn<T>(values: readonly T[], x: any): x is T {
    return values.includes(x)
}

const CONTENT_TYPE = ['answer', 'article', 'pin'] as const

/**
 * - `answer` - 回答
 * - `article` - 文章
 * - `pin` - 想法
 */
type ZhihuContentType = (typeof CONTENT_TYPE)[number]

export interface ZhihuMetadata {
    authorName: string
    itemId: string
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

/**
 * 扩展元数据
 */
const extendMetadata = (item: HTMLElement, rawMetadata: ZhihuMetadata): ZhihuMetadata => {
    rawMetadata.visitTime = Date.now()
    const extractMetadata = (): string | undefined => {
        const span = item.querySelector<HTMLSpanElement>('.RichText')
        if (!span) return undefined
        let text = span.innerText.trim()
        /**
         * 如果获取到的内容不包含作者名称，则手动添加作者前缀
         * 这通常发生在回答正好被展开的情况下，此时获取的是不包括作者名的正文
         */
        if (!text.startsWith(rawMetadata.authorName)) text = `${rawMetadata.authorName}：${text}`
        return text.length > 120 ? `${text.slice(0, 120)}...` : text
    }
    switch (rawMetadata.type) {
        case 'pin': {
            const userLink = item.closest('.Feed')?.querySelector<HTMLAnchorElement>('.UserLink-link')
            if (userLink) rawMetadata.authorName = userLink.innerText.trim()
            rawMetadata.url = `https://www.zhihu.com/pin/${rawMetadata.itemId}`
            break
        }

        case 'article':
        case 'answer': {
            if (!rawMetadata.url) {
                const linkEl = item.querySelector<HTMLAnchorElement>('.ContentItem-title a')
                if (linkEl) rawMetadata.url = linkEl.href
            }
            rawMetadata.content = extractMetadata()
            break
        }
    }
    return rawMetadata
}

const extractMetadataFromZop = (item: HTMLElement): Result<ZhihuMetadata, string> => {
    const zop = item.dataset.zop
    if (!zop) return Result.Err(`无法读取回答或文章信息：${JSON.stringify(item.dataset)}`)
    return Result.try(() => JSON.parse(zop) as ZhihuMetadata).mapErr((err) =>
        err instanceof Error ? err.message : String(err)
    )
}

const extractMetadataFromSearch = (item: HTMLElement): Result<ZhihuMetadata, string> => {
    const type =
        item.getAttribute('itemprop') ||
        // 如果没有 itemprop 属性，检查是否有关注按钮来确定是否为回答类型
        (item.querySelector('.FollowButton') ? 'answer' : undefined)
    if (!type) return Result.Err(`元素缺少 itemprop 属性：${item.outerHTML.substring(0, 100)}...`)
    if (!isIn(CONTENT_TYPE, type))
        return Result.Err(`元素 itemprop 值不合法："${type}"，支持的类型：${CONTENT_TYPE.join(', ')}`)

    // 获取链接元素
    const linkEL = item.querySelector<HTMLAnchorElement>('a')
    if (!linkEL) return Result.Err(`元素缺少链接标签：${item.outerHTML.substring(0, 100)}...`)
    const url = linkEL.href

    // 提取标题
    const titleElement = item.querySelector<HTMLSpanElement>('.ContentItem-title')
    if (!titleElement) return Result.Err(`元素缺少标题标签：${item.outerHTML.substring(0, 100)}...`)
    const title = titleElement.innerText.trim()
    if (!title) return Result.Err(`元素的标题内容为空`)

    // 从URL中提取内容ID
    const itemId = url.split('/').pop()
    if (!itemId) return Result.Err(`无法从 URL 中提取 itemId：${url}`)

    return Result.Ok({
        authorName: '', // 知乎重构界面后已经不需要显示存储作者名
        type,
        itemId,
        url,
        title,
    })
}

/**
 * 通用函数，从 DOM 元素中提取和保存历史记录
 */
const saveHistoryFromElement = (
    item: HTMLElement,
    extractMetadata: (item: HTMLElement) => Result<ZhihuMetadata, string>
): Result<null, string> => {
    return extractMetadata(item)
        .map((data) => extendMetadata(item, data))
        .andThen((metadata) =>
            saveHistory(metadata).mapErr((err) => (err instanceof Error ? err.message : String(err)))
        )
}

/**
 * 从 DOM 元素中提取历史记录信息并保存（对于首页推荐的元素）
 * 由于首页推荐的元素使用了 zop 属性来存储数据，因此需要使用不同的提取函数
 */
export const saveHistoryFromHomePageElement = (item: HTMLElement): Result<null, string> =>
    saveHistoryFromElement(item, extractMetadataFromZop)

/**
 * 从 DOM 元素中提取历史记录信息并保存（对于搜索结果的元素）
 */
export const saveHistoryFromSearchElement = (item: HTMLElement): Result<null, string> => {
    // 处理知乎热榜的内容，拥有 name 属性的 ContentItem 可能是热榜中的内容
    if (item.hasAttribute('name')) {
        const newItem = item // 此时的 .ContentItem 是大的 .ContentItem 的子元素，需要在上级元素中查找我们需要的子元素
            .closest('.HotLanding-contentItem')
            ?.querySelector<HTMLElement>('.ContentItem')
        if (newItem) {
            // 使用找到的正确元素
            return saveHistoryFromElement(newItem, extractMetadataFromSearch)
        }
    }
    return saveHistoryFromElement(item, extractMetadataFromSearch)
}

export const trackHomepageHistory = () => {
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
        saveHistoryFromHomePageElement(item).mapErr((err) => logger.error(err))
    })
}

export const trackSearchHistory = () => {
    const params = new URLSearchParams(location.search)
    if (params.get('type') !== 'content') return

    const container = document.querySelector('.Search-container')

    if (!container) {
        logger.error('未找到搜索结果容器')
        return
    }

    container.addEventListener('click', (e) => {
        const target = e.target
        if (!(target instanceof HTMLElement)) return
        const item = target.closest<HTMLElement>('.ContentItem')
        if (!item) return
        saveHistoryFromSearchElement(item).mapErr((err) => logger.error(err))
    })
}

/**
 * 监听点击事件，保存浏览历史
 */
export const trackHistory = () => {
    switch (window.location.pathname) {
        case '/':
        case '/follow':
        case '/hot':
        case '/column-square': {
            trackHomepageHistory()
            break
        }
        case '/search': {
            trackSearchHistory()
            break
        }
    }
}
