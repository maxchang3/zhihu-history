import Item from '@/styles/Item.module.css'
import type { ZhihuMetadata } from '@/utils/history'
import type { SearchResult } from '@/utils/search'
import { Fragment, forwardRef, useMemo } from 'react'

interface HistoryItemProps {
    item: ZhihuMetadata
    searchResult?: SearchResult
}

/**
 * 格式化时间，临近时使用相对时间，远离时使用绝对时间
 */
const formatTime = (date: Date): string => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return '刚刚'
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
    return date.toLocaleDateString('zh-CN')
}

type TextPart = {
    text: string
    highlight: boolean
}

/**
 * 将文本按照搜索结果中的匹配位置分割，并高亮匹配的部分
 */
const highlightTextWithPositions = (
    text: string,
    fieldPositions: Array<{ start: number; end: number; term: string }> | undefined
): string | React.ReactNode[] => {
    // 无匹配位置时直接返回原文本
    if (!fieldPositions || fieldPositions.length === 0) return text

    // 优化：首先标记需要高亮的字符位置
    const highlightMarkers = new Array(text.length).fill(false)

    // 标记所有匹配位置
    for (const { start, end } of fieldPositions) {
        const endIndex = Math.min(end, text.length)
        for (let i = start; i < endIndex; i++) {
            highlightMarkers[i] = true
        }
    }

    // 合并连续的相同类型片段
    const segments: TextPart[] = []
    let currentSegment: TextPart | null = null

    // 构建文本片段
    for (let i = 0; i < text.length; i++) {
        const shouldHighlight = highlightMarkers[i]

        // 需要创建新片段的情况：1) 首个字符 2) 高亮状态切换
        if (!currentSegment || currentSegment.highlight !== shouldHighlight) {
            // 保存前一个片段
            if (currentSegment) segments.push(currentSegment)

            // 创建新片段
            currentSegment = {
                text: text[i],
                highlight: shouldHighlight,
            }
            continue
        }
        // 继续当前片段
        currentSegment.text += text[i]
    }

    // 添加最后一个片段
    if (currentSegment) segments.push(currentSegment)

    // 渲染各个片段
    return segments.map((segment, index) =>
        segment.highlight ? (
            <span key={index} className={Item.highlight}>
                {segment.text}
            </span>
        ) : (
            <Fragment key={index}>{segment.text}</Fragment>
        )
    )
}

export const HistoryItem = forwardRef<HTMLAnchorElement, HistoryItemProps>(({ item, searchResult }, ref) => {
    const contentTypeMap = {
        answer: '问题',
        article: '文章',
        pin: '想法',
    } satisfies Record<ZhihuMetadata['type'], string>

    // 处理访问时间
    const visitTime = !item.visitTime ? null : new Date(item.visitTime)
    const formattedVisitTime = !visitTime
        ? null
        : {
              short: formatTime(visitTime),
              full: visitTime.toLocaleString('zh-CN'),
          }

    // 高亮处理标题文本
    const highlightedTitle = useMemo(
        () => highlightTextWithPositions(item.title, searchResult?.matches?.title),
        [item.title, searchResult]
    )

    // 高亮处理内容文本（如果存在）
    const highlightedContent = useMemo(() => {
        if (!item.content) return null
        return highlightTextWithPositions(item.content, searchResult?.matches?.content)
    }, [item.content, searchResult])

    // 高亮处理作者名（仅在没有访问时间时显示）
    const highlightedAuthorName = useMemo(() => {
        // 有访问时间或无搜索结果时不处理作者名
        if (formattedVisitTime || !searchResult) return null
        return highlightTextWithPositions(item.authorName, searchResult.matches?.authorName)
    }, [item.authorName, formattedVisitTime, searchResult])

    return (
        <li className={Item.item}>
            <a href={item.url} className={Item.link} ref={ref}>
                <span className={Item.srOnly}>{contentTypeMap[item.type]}</span>
                <div className={Item.header}>
                    <span className={`${Item.title} ${Item[item.type]}`}>{highlightedTitle}</span>
                    <span className={Item.visitTime} title={formattedVisitTime?.full} aria-hidden tabIndex={-1}>
                        {formattedVisitTime?.short ?? (highlightedAuthorName || item.authorName)}
                    </span>
                </div>
                {
                    // 没有访问时间的是之前的历史记录，没有包含作者的 content，所以需要提示作者
                    !formattedVisitTime && <span className={Item.srOnly}>作者：{item.authorName}</span>
                }
                {formattedVisitTime && (
                    <span className={Item.srOnly}>
                        浏览于<time dateTime={formattedVisitTime.short}>{formattedVisitTime.short}</time>
                    </span>
                )}
            </a>
            {item.content && <p className={Item.content}>{highlightedContent}</p>}
        </li>
    )
})
