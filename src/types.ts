export const CONTENT_TYPE = ['answer', 'article', 'pin'] as const

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
