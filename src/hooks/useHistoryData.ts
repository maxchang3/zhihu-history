import { useCallback, useState } from 'react'
import { fetchHistory } from '@/features/api'
import type { HistoryItemType } from '@/types'
import { logger } from '@/utils/logger'

export const useHistoryData = () => {
    const [historyItems, setHistoryItems] = useState<HistoryItemType[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)

    const loadHistory = useCallback(async (offset = 0, isLoadMore = false) => {
        const currentLoadingState = isLoadMore ? setLoadingMore : setLoading
        currentLoadingState(true)
        setError(null)
        try {
            const result = await fetchHistory(offset, 50) // 每次加载 50 条
            if (result.isOk()) {
                const newItems = result.unwrap()
                if (isLoadMore) {
                    setHistoryItems((prev) => [...prev, ...newItems])
                } else {
                    setHistoryItems(newItems)
                }
                setHasMore(newItems.length === 50) // 如果返回的数量小于 50，说明没有更多数据了
            } else {
                const error = result.unwrapErr()
                setError(error)
                logger.error(error)
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : '加载历史记录失败'
            setError(errorMsg)
            logger.error(errorMsg)
        } finally {
            currentLoadingState(false)
        }
    }, [])

    const handleLoadMore = useCallback(() => {
        loadHistory(historyItems.length, true)
    }, [historyItems.length, loadHistory])

    const clearHistoryItems = useCallback(() => {
        setHistoryItems([])
    }, [])

    return {
        historyItems,
        loading,
        loadingMore,
        error,
        hasMore,
        loadHistory,
        handleLoadMore,
        clearHistoryItems,
        setHistoryItems,
    }
}
