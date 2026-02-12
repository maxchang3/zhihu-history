import { useCallback, useState } from 'react'
import { HISTORY_LOAD_LIMIT } from '@/constants'
import { fetchHistory } from '@/features/api'
import type { HistoryItemType } from '@/types'
import { logger } from '@/utils/logger'

export const useHistoryData = () => {
    const [historyItems, setHistoryItems] = useState<HistoryItemType[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [isLoadingAll, setIsLoadingAll] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)

    const loadHistory = useCallback(async (offset = 0, isLoadMore = false, limit = HISTORY_LOAD_LIMIT) => {
        const currentLoadingState = isLoadMore ? setLoadingMore : setLoading
        currentLoadingState(true)
        setError(null)
        try {
            const result = await fetchHistory(offset, limit)
            if (result.isOk()) {
                const { data: newItems, is_end } = result.unwrap()
                if (isLoadMore) {
                    setHistoryItems((prev) => [...prev, ...newItems])
                } else {
                    setHistoryItems(newItems)
                }
                setHasMore(!is_end)
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

    const loadAllHistory = useCallback(async () => {
        setIsLoadingAll(true)
        setError(null)
        try {
            let offset = historyItems.length
            let allLoaded = false

            while (!allLoaded && hasMore) {
                const result = await fetchHistory(offset, HISTORY_LOAD_LIMIT)
                if (result.isOk()) {
                    const { data: newItems, is_end } = result.unwrap()
                    setHistoryItems((prev) => [...prev, ...newItems])
                    offset += newItems.length
                    allLoaded = is_end
                    setHasMore(!allLoaded)
                } else {
                    const error = result.unwrapErr()
                    setError(error)
                    logger.error(error)
                    allLoaded = true
                }
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : '加载所有历史记录失败'
            setError(errorMsg)
            logger.error(errorMsg)
        } finally {
            setIsLoadingAll(false)
        }
    }, [historyItems.length, hasMore])

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
        isLoadingAll,
        error,
        hasMore,
        loadHistory,
        loadAllHistory,
        handleLoadMore,
        clearHistoryItems,
        setHistoryItems,
    }
}
