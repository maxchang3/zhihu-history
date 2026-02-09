export enum ZhihuContentType {
    Answer = 'answer',
    Article = 'article',
    Pin = 'pin',
    Profile = 'profile',
    Question = 'question',
}

// API 响应数据类型
export interface ReadHistoryResponse {
    data: HistoryItemType[]
    paging: {
        is_end: boolean
        is_start: boolean
        next: string
        previous: string
        totals: number
    }
}

export interface HistoryItemType {
    card_type: string
    data: {
        header: {
            icon?: string
            title: string
            action?: {
                type: string
                url: string
            }
        }
        content?: {
            author_name?: string
            summary?: string
            cover_image?: string
        }
        matrix?: Array<{
            type: string
            data: {
                text?: string
            }
        }>
        action: {
            type: string
            url: string
        }
        extra: {
            content_token: string
            content_type: ZhihuContentType
            read_time: number
            question_token?: string
            share_info?: unknown
            mcn_source?: string
        }
    }
}

export interface HistoryStatsResponse {
    disabled: boolean
    count: number
    has_batch_report: boolean
}

export interface DeleteHistoryRequest {
    pairs: Array<{
        content_token: string
        content_type: ZhihuContentType
    }>
    clear: boolean
}
