import { Fragment, forwardRef, useMemo } from 'react'
import type { SearchResult } from '@/features/search'
import type { HistoryItemType } from '@/types'

interface HistoryItemProps {
    item: HistoryItemType
    searchResult?: SearchResult
    isSelected?: boolean
    onToggleSelect?: () => void
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
        segment.highlight ? <em key={index}>{segment.text}</em> : <Fragment key={index}>{segment.text}</Fragment>
    )
}

export const HistoryItem = forwardRef<HTMLAnchorElement, HistoryItemProps>(
    ({ item, searchResult, isSelected = false, onToggleSelect }, ref) => {
        const contentTypeMap = {
            answer: '问题',
            article: '文章',
            pin: '想法',
            profile: '用户',
            question: '问题',
        } satisfies Record<HistoryItemType['data']['extra']['content_type'], string>

        // 处理访问时间
        const visitTime = new Date(item.data.extra.read_time * 1000)
        const formattedVisitTime = {
            short: formatTime(visitTime),
            full: visitTime.toLocaleString('zh-CN'),
        }

        // 高亮处理标题文本
        const highlightedTitle = useMemo(
            () => highlightTextWithPositions(item.data.header.title, searchResult?.matches?.title),
            [item.data.header.title, searchResult]
        )

        // 高亮处理内容文本（如果存在）
        const highlightedContent = useMemo(() => {
            if (!item.data.content?.summary) return null
            return highlightTextWithPositions(item.data.content.summary, searchResult?.matches?.content)
        }, [item.data.content?.summary, searchResult])

        // 获取赞同和评论信息
        const metaText = useMemo(() => {
            if (item.data.matrix?.length) {
                return item.data.matrix[0].data.text || ''
            }
            return null
        }, [item.data.matrix])

        return (
            <li
                className={`py-2 border-b-base flex flex-col items-start last:border-b-0 ${isSelected ? 'bg-highlight rounded' : ''}`}
            >
                <div className="flex-1 flex flex-col min-w-0 w-full">
                    <a
                        href={item.data.action.url}
                        className="flex-1 text-primary decoration-none min-w-0 w-full hover:text-blue-600  focus:text-blue-600 dark:(hover:text-blue-400 focus:text-blue-400) transition"
                        ref={ref}
                        tabIndex={0}
                    >
                        <span className="srOnly">{contentTypeMap[item.data.extra.content_type]}</span>
                        <div className="flex items-center w-full relative">
                            {/* 选择复选框 */}
                            {onToggleSelect && (
                                <input
                                    type="checkbox"
                                    className="absolute left-[-1.6rem] cursor-pointer flex-shrink-0 w-3.5 h-3.5"
                                    checked={isSelected}
                                    onChange={onToggleSelect}
                                    aria-label="选择"
                                />
                            )}
                            {item.data.header.icon && (
                                <img
                                    src={item.data.header.icon}
                                    alt={contentTypeMap[item.data.extra.content_type]}
                                    className="mr-1 w-4 h-4 object-contain flex-shrink-0 rounded"
                                    loading="lazy"
                                />
                            )}
                            <span className="flex-1 font-medium transition-colors whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
                                {highlightedTitle}
                            </span>
                            <span
                                className="text-secondary text-sm whitespace-nowrap flex-shrink-0"
                                title={formattedVisitTime.full}
                                aria-hidden
                                tabIndex={-1}
                            >
                                {formattedVisitTime.short}
                            </span>
                        </div>
                        <span className="srOnly">
                            浏览于<time dateTime={formattedVisitTime.short}>{formattedVisitTime.short}</time>
                        </span>
                    </a>
                    {item.data.content?.summary && (
                        <p className="text-secondary text-sm m-0 mt-1 overflow-hidden text-ellipsis break-words line-clamp-2">
                            {highlightedContent}
                        </p>
                    )}

                    {/* 底部操作栏 */}
                    <div className="mt-1 text-xs text-secondary pt-1">
                        {metaText && <span className="text-inherit text-xs">{metaText}</span>}
                    </div>
                </div>
            </li>
        )
    }
)
