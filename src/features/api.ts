import type { DeleteHistoryRequest, HistoryItemType, HistoryStatsResponse, ReadHistoryResponse } from '@/types'
import { Result } from '@/utils/result'

// API 基础配置
const API_BASE = 'https://www.zhihu.com/api/v4'

/**
 * 批量删除历史记录
 */
export const batchDeleteHistory = async (requestData: DeleteHistoryRequest): Promise<Result<null, string>> => {
    const result = await Result.tryAsync(async () => {
        const response = await fetch(`${API_BASE}/read_history/batch_del`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return null
    })
    return result.mapErr((error) => `操作失败：${error}`)
}

/**
 * 获取浏览历史
 */
export const fetchHistory = async (offset = 0, limit = 20): Promise<Result<HistoryItemType[], string>> => {
    const result = await Result.tryAsync(async () => {
        const response = await fetch(`${API_BASE}/unify-consumption/read_history?offset=${offset}&limit=${limit}`)

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data: ReadHistoryResponse = await response.json()
        return data.data
    })
    return result.mapErr((error) => `获取历史记录失败：${error}`)
}

/**
 * 清空所有历史记录
 */
export const clearHistory = async (): Promise<Result<null, string>> => {
    return batchDeleteHistory({
        pairs: [],
        clear: true,
    })
}

/**
 * 获取历史记录统计信息
 */
export const getHistoryStats = async (): Promise<Result<HistoryStatsResponse, string>> => {
    const result = await Result.tryAsync(async () => {
        const response = await fetch(`${API_BASE}/read_history/total`)

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data: HistoryStatsResponse = await response.json()
        return data
    })
    return result.mapErr((error) => `获取统计信息失败：${error}`)
}
