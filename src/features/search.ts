import type { ZhihuMetadata } from '@/types'

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

            // 过滤掉语气词、停留词、标点符号、空白、单字
            // biome-ignore format: keep clean
            const ignoreWords = new Set(['的','了','是','在','和','有','就','不','也','这',
                '那','吗','吧','啊','哦','啦','呀','！','？','，','。','、','；','：','“','”',
                '‘','’','《','》','[',']','{','}','.', '(',')','【','】','——','—','…','·'
            ])
            const segments = Array.from(segmenterInstance.segment(trimmedText))
                .map((item) => item.segment.trim())
                .filter((word) => word && !ignoreWords.has(word))

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
 * 匹配规则：标题、内容或作者名中包含关键词
 */
export const isItemMatch = (item: ZhihuMetadata, term: string): boolean => {
    // 空搜索词总是匹配所有项
    if (!term) return true

    const lowerTerm = term.toLowerCase()
    const { title, content, authorName } = item

    // 标题匹配
    if (title.toLowerCase().includes(lowerTerm)) return true

    // 内容匹配（如果有内容）
    if (content?.toLowerCase().includes(lowerTerm)) return true

    // 作者名匹配
    return authorName.toLowerCase().includes(lowerTerm)
}

// 可搜索的字段类型
export type SearchableField = 'title' | 'content' | 'authorName'

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

/**
 * 查找字段中所有匹配位置
 */
const findAllMatches = (text: string | undefined, searchTerm: string): MatchPosition[] => {
    if (!text) return []

    const result: MatchPosition[] = []
    const termLower = searchTerm.toLowerCase()
    let startIndex = 0
    let matchIndex: number

    // 查找所有匹配位置
    // biome-ignore lint/suspicious/noAssignInExpressions: keep it clean
    while ((matchIndex = text.toLowerCase().indexOf(termLower, startIndex)) !== -1) {
        result.push({
            start: matchIndex,
            end: matchIndex + searchTerm.length,
            term: searchTerm,
        })
        startIndex = matchIndex + 1
    }

    return result
}

/**
 * 对历史项进行搜索，返回匹配的项及匹配位置信息
 */
export const searchItem = (items: ZhihuMetadata[], term: string): Map<number, SearchResult> => {
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

        // 遍历所有搜索词
        for (const searchTerm of searchTerms) {
            // 跳过不匹配的项
            if (!isItemMatch(item, searchTerm)) continue

            // 记录匹配的搜索词
            if (!itemResult.terms.includes(searchTerm)) {
                itemResult.terms.push(searchTerm)
            }

            hasMatches = true

            // 处理各字段的匹配
            const fields: SearchableField[] = ['title', 'authorName']
            if (item.content) fields.push('content')

            fields.forEach((field) => {
                const text = item[field]
                const matches = findAllMatches(text, searchTerm)

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
