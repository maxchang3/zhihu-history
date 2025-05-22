import { CONTENT_TYPE, type ZhihuMetadata } from '@/types'
import { logger } from '@/utils/logger'
import { Result } from '@/utils/result'
import { type PageType, getPageType } from '@/utils/route'
import { saveHistory } from './storage'

// biome-ignore lint/suspicious/noExplicitAny: use for type guard
function isIn<T>(values: readonly T[], x: any): x is T {
    return values.includes(x)
}

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
    return Result.try(() => JSON.parse(zop) as ZhihuMetadata).mapErr((err) => `解析数据失败：${err}`)
}

const extractMetadataFromSearch = (item: HTMLElement): Result<ZhihuMetadata, string> => {
    const truncateText = (text: string, maxLength = 120) => `${text.substring(0, maxLength)}...`
    /**
     * 如果有 `name` 属性，说明是热榜问题中的某一个回答，此处 `name` 为回答 ID
     * 热榜的内容为一个问题对应多个答案。（所以类型一定是回答）
     *   大概结构是：
     *   ```html
     *   <div class="HotLanding-contentItem">
     *       <div class="ContentItem">
     *          <div class="ContentItem-title">问题标题</div>
     *       </div>
     *       <div class="ContentItem AnswerItem" name="xxx1" >...</div>
     *       <div class="ContentItem AnswerItem" name="xxx2" >...</div>
     *   </div>
     *   ```
     */
    const hotLandingId = item.getAttribute('name')
    const type =
        item.getAttribute('itemprop') ||
        // 如果没有 `itemprop` 属性，检查是否有关注按钮，如果有的话，说明是单独的问题
        (item.querySelector('.FollowButton') ? 'answer' : undefined)

    if (!type) return Result.Err(`元素缺少 itemprop 属性：${truncateText(item.outerHTML)}`)
    if (!isIn(CONTENT_TYPE, type))
        return Result.Err(`元素 itemprop 值不合法："${type}"，支持的类型：${CONTENT_TYPE.join(', ')}`)

    // 尝试获取一下作者名称
    const authorName =
        item.querySelector<HTMLElement>('b[data-first-child]')?.textContent || // 未展开的回答
        item.querySelector<HTMLElement>('.AuthorInfo-name')?.textContent || // 已经展开的回答
        ''
    // 如果点击的是热榜中的某一个子回答，则需要向上查找父元素 `.HotLanding-contentItem`
    // 从而获取问题标题和链接，然后把问题链接和回答 ID 拼接成完整的 URL。
    if (hotLandingId) {
        const newItem = item.closest<HTMLElement>('.HotLanding-contentItem')
        if (newItem) {
            // biome-ignore lint/style/noParameterAssign: 此处需要修改 item 以简化处理逻辑
            item = newItem
        }
    }

    // 获取链接元素
    const linkEl = item.querySelector<HTMLAnchorElement>('a')
    if (!linkEl) return Result.Err(`元素缺少链接标签：${truncateText(item.outerHTML)}`)
    const url = linkEl.href + (hotLandingId ? `/answer/${hotLandingId}` : '')

    // 提取标题
    const titleElement = item.querySelector<HTMLSpanElement>('.ContentItem-title')
    if (!titleElement) return Result.Err(`元素缺少标题标签：${truncateText(item.outerHTML)}`)
    const title = titleElement.innerText.trim()
    if (!title) return Result.Err(`元素的标题内容为空`)

    // 从 URL 中提取内容ID
    const itemId = url.split('/').pop()
    if (!itemId) return Result.Err(`无法从 URL 中提取 itemId：${url}`)

    return Result.Ok({
        authorName,
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
) =>
    extractMetadata(item)
        .map((data) => extendMetadata(item, data))
        .andThen(saveHistory)

/**
 * 从 DOM 元素中提取历史记录信息并保存（对于首页推荐的元素）
 */
export const saveHistoryFromHomePageElement = (item: HTMLElement) =>
    saveHistoryFromElement(item, extractMetadataFromZop)

/**
 * 从 DOM 元素中提取历史记录信息并保存（对于搜索结果的元素）
 */
export const saveHistoryFromSearchElement = (item: HTMLElement) =>
    saveHistoryFromElement(item, extractMetadataFromSearch)

/**
 * 记录拥有 zop 属性页面的点击事件
 */
export const trackZopHistory = (selector: string) => {
    const container = document.querySelector<HTMLDivElement>(selector)

    if (!container) {
        logger.error('未找到首页推荐容器')
        return
    }

    const handleContentItem = (getItem: () => HTMLElement | null) => {
        const item = getItem()
        if (!item) return
        saveHistoryFromHomePageElement(item).mapErr((err) => logger.error(err))
    }

    container.addEventListener('click', (e) => {
        const target = e.target
        if (!(target instanceof HTMLElement)) return
        handleContentItem(() => target.closest<HTMLElement>('.ContentItem'))
    })

    container.addEventListener('keydown', (e) => {
        if (e.key !== 'o') return
        const target = e.target
        if (!(target instanceof HTMLElement)) return
        handleContentItem(() => target.querySelector<HTMLElement>('.ContentItem'))
    })
}

export const trackSearchHistory = () => {
    const params = new URLSearchParams(location.search)
    if (params.get('type') !== 'content') return

    const container = document.querySelector<HTMLDivElement>('.Search-container')

    if (!container) {
        logger.error('未找到搜索结果容器')
        return
    }

    const handleContentItem = (getItem: () => HTMLElement | null) => {
        let item = getItem()
        if (!item) return

        if (item.dataset?.zaDetailViewPathModule === 'Content') {
            // 如果我们获取到的 ContentItem 有这个属性值，说明他是热榜的问题，我们直接取第一个回答
            const newItem = item.parentElement?.querySelectorAll<HTMLElement>('.ContentItem')[1]
            if (newItem) item = newItem
        }

        saveHistoryFromSearchElement(item).mapErr((err) => logger.error(err))
    }

    container.addEventListener('click', (e) => {
        const target = e.target
        if (!(target instanceof HTMLElement)) return
        handleContentItem(() => target.closest<HTMLElement>('.ContentItem'))
    })

    container.addEventListener('keydown', (e) => {
        if (e.key !== 'o') return
        const target = e.target
        if (!(target instanceof HTMLElement)) return
        handleContentItem(() => target.querySelector<HTMLElement>('.ContentItem'))
    })
}

/**
 * 获取当前页面的内容选择器
 */
const getContentSelector = (pageType: Exclude<PageType, 'search'>) => {
    switch (pageType) {
        case 'home':
            return '#TopstoryContent'
        case 'topic':
            return '#TopicMain'
        default:
            return null
    }
}

/**
 * 监听点击事件，保存浏览历史
 */
export const trackHistory = () => {
    const pageType = getPageType(location.pathname)
    if (!pageType) {
        logger.error(`当前页面类型不支持：${location.pathname}`)
        return
    }
    switch (pageType) {
        case 'home':
        case 'topic': {
            const selector = getContentSelector(pageType)
            if (selector) trackZopHistory(selector)
            break
        }
        case 'search':
            trackSearchHistory()
            break
    }
}
