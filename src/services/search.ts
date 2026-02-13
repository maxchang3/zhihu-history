import type { HistoryItemType } from '@/types'

// 过滤掉语气词、停留词、标点符号、空白、单字
// biome-ignore format: keep clean
const ignoreWords = new Set([
    '的','了','是','在','和','有','就','不','也','这', '那','吗','吧','啊','哦','啦','呀',
    '！','？','，','。','、','；','：','“','”','‘','’','《','》','[',']','{','}','.',
    '(',')','【','】','——','—','…','·'
])

/**
 * 使用 Intl.Segmenter 或空格分割进行分词
 */
const createSegmenter = () => {
    // 使用 Intl.Segmenter 进行中文分词（如果支持）
    if (Intl?.Segmenter) {
        const segmenterInstance = new Intl.Segmenter('zh', { granularity: 'word' })
        return (text: string) => {
            const trimmedText = text.trim()
            if (!trimmedText) return []

            const tokens = trimmedText
                .split(/\s+/)
                .map((token) => token.trim())
                .filter(Boolean)
            const segments: string[] = []

            for (const token of tokens) {
                if (token.length === 1) {
                    segments.push(token)
                    continue
                }

                const tokenSegments = Array.from(segmenterInstance.segment(token))
                    .map((item) => item.segment.trim())
                    .filter((word) => word && !ignoreWords.has(word))
                    .filter((word) => word.length > 1)

                segments.push(token, ...tokenSegments)
            }

            // 确保原始查询词也包含在内
            const uniqueTerms = new Set([...segments, trimmedText])
            return Array.from(uniqueTerms)
        }
    }

    // 降级：使用空格分割
    return (text: string) => {
        const trimmedText = text.trim()
        if (!trimmedText) return []

        const parts = trimmedText
            .split(/\s+/)
            .map((part) => part.trim())
            .filter(Boolean)

        // 确保原始查询词也包含在内
        const uniqueTerms = new Set([...parts, trimmedText])
        return Array.from(uniqueTerms)
    }
}

const segmenter = createSegmenter()

/**
 * 判断某一项是否匹配搜索关键词
 * 匹配规则：标题、内容中包含关键词
 */
export const isItemMatch = (item: HistoryItemType, term: string): boolean => {
    // 空搜索词总是匹配所有项
    if (!term) return true

    const lowerTerm = term.toLowerCase()
    const { title } = item.data.header
    const { summary } = item.data.content || {}

    // 标题匹配
    if (title.toLowerCase().includes(lowerTerm)) return true

    // 内容匹配（如果有内容）
    if (summary?.toLowerCase().includes(lowerTerm)) return true

    return false
}

// 可搜索的字段类型
export type SearchableField = 'title' | 'content'

/**
 * 匹配位置信息
 */
export interface MatchPosition {
    start: number
    end: number
    term: string
}

/**
 * 搜索结果类型
 */
export interface SearchResult {
    // 匹配到的搜索词
    terms: string[]
    // 每个字段的匹配位置
    matches: Record<SearchableField, MatchPosition[]> | Record<string, never>
}

export interface TextSegment {
    text: string
    highlight: boolean
}

/**
 * 查找字段中所有匹配位置
 */
const findAllMatches = (
    text: string | undefined,
    searchTerm: string,
    lowerText: string | undefined = text?.toLowerCase()
): MatchPosition[] => {
    if (!text || !lowerText) return []

    const result: MatchPosition[] = []
    const termLower = searchTerm.toLowerCase()
    let startIndex = 0
    let matchIndex: number

    // 查找所有匹配位置
    // biome-ignore lint/suspicious/noAssignInExpressions: keep it clean
    while ((matchIndex = lowerText.indexOf(termLower, startIndex)) !== -1) {
        result.push({
            start: matchIndex,
            end: matchIndex + searchTerm.length,
            term: searchTerm,
        })
        startIndex = matchIndex + 1
    }

    return result
}

const mergeMatchRanges = (ranges: MatchPosition[], textLength: number): Array<{ start: number; end: number }> => {
    if (ranges.length === 0) return []

    const sorted = ranges
        .map((range) => ({
            start: Math.max(0, Math.min(range.start, textLength)),
            end: Math.max(0, Math.min(range.end, textLength)),
        }))
        .filter((range) => range.end > range.start)
        .sort((a, b) => a.start - b.start)

    if (sorted.length === 0) return []

    const merged: Array<{ start: number; end: number }> = [sorted[0]]
    for (let i = 1; i < sorted.length; i++) {
        const last = merged[merged.length - 1]
        const current = sorted[i]
        if (current.start <= last.end) {
            last.end = Math.max(last.end, current.end)
            continue
        }
        merged.push(current)
    }

    return merged
}

export const buildHighlightSegments = (text: string, fieldPositions: MatchPosition[] | undefined): TextSegment[] => {
    if (!fieldPositions || fieldPositions.length === 0) {
        return [{ text, highlight: false }]
    }

    const ranges = mergeMatchRanges(fieldPositions, text.length)
    if (ranges.length === 0) {
        return [{ text, highlight: false }]
    }

    const segments: TextSegment[] = []
    let cursor = 0

    for (const range of ranges) {
        if (cursor < range.start) {
            segments.push({ text: text.slice(cursor, range.start), highlight: false })
        }
        segments.push({ text: text.slice(range.start, range.end), highlight: true })
        cursor = range.end
    }

    if (cursor < text.length) {
        segments.push({ text: text.slice(cursor), highlight: false })
    }

    return segments
}

/**
 * 对历史项进行搜索，返回匹配的项及匹配位置信息
 */
export const searchItem = (items: HistoryItemType[], term: string): Map<number, SearchResult> => {
    // 快速返回：空关键词
    if (!term) return new Map()

    const result = new Map<number, SearchResult>()
    const searchTerms = segmenter(term)

    // 遍历所有项
    items.forEach((item, index) => {
        // 记录匹配结果
        let hasMatches = false
        const itemResult: SearchResult = {
            terms: [],
            matches: {},
        }

        const title = item.data.header.title
        const summary = item.data.content?.summary
        const lowerTitle = title.toLowerCase()
        const lowerSummary = summary?.toLowerCase()
        const fields: SearchableField[] = ['title']
        if (summary) fields.push('content')

        // 遍历所有搜索词
        for (const searchTerm of searchTerms) {
            const lowerTerm = searchTerm.toLowerCase()

            // 跳过不匹配的项
            if (!lowerTitle.includes(lowerTerm) && !lowerSummary?.includes(lowerTerm)) continue

            // 记录匹配的搜索词
            if (!itemResult.terms.includes(searchTerm)) {
                itemResult.terms.push(searchTerm)
            }

            hasMatches = true

            // 处理各字段的匹配
            fields.forEach((field) => {
                const text = field === 'content' ? summary : title
                const textLower = field === 'content' ? lowerSummary : lowerTitle
                const matches = findAllMatches(text, searchTerm, textLower)

                if (matches.length > 0) {
                    // 初始化字段的匹配数组
                    if (!itemResult.matches[field]) {
                        itemResult.matches[field] = []
                    }

                    // 添加匹配位置
                    itemResult.matches[field].push(...matches)
                }
            })
        }

        // 只保存有匹配的结果
        if (hasMatches) result.set(index, itemResult)
    })

    return result
}
