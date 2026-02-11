import { useCallback, useState } from 'react'
import { batchDeleteHistory, clearHistory } from '@/features/api'
import type { HistoryItemType } from '@/types'
import { logger } from '@/utils/logger'

export const useHistoryOperations = () => {
    const [isClearing, setIsClearing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleClearHistory = useCallback(async (onSuccess?: () => void) => {
        if (!window.confirm('确定要清空所有最近浏览吗？此操作不可恢复。')) {
            return
        }

        setIsClearing(true)
        try {
            const result = await clearHistory()
            if (result.isOk()) {
                onSuccess?.()
            } else {
                logger.error(result.unwrapErr())
            }
        } catch (err) {
            logger.error('清空历史记录失败:', err)
        } finally {
            setIsClearing(false)
        }
    }, [])

    const handleBatchDelete = useCallback(
        async (
            historyItems: HistoryItemType[],
            selectedItems: Set<string>,
            onSuccess?: (deletedCount: number) => void
        ) => {
            if (selectedItems.size === 0) {
                return
            }

            if (!window.confirm(`确定要删除选中的 ${selectedItems.size} 条历史记录吗？此操作不可恢复。`)) {
                return
            }

            setIsDeleting(true)
            try {
                const itemsToDelete = historyItems.filter((item) => selectedItems.has(item.data.extra.content_token))
                const result = await batchDeleteHistory({
                    pairs: itemsToDelete.map((item) => ({
                        content_token: item.data.extra.content_token,
                        content_type: item.data.extra.content_type,
                    })),
                    clear: false,
                })

                if (result.isOk()) {
                    onSuccess?.(selectedItems.size)
                } else {
                    logger.error('删除失败:', result.unwrapErr())
                }
            } catch (err) {
                logger.error('批量删除失败:', err)
            } finally {
                setIsDeleting(false)
            }
        },
        []
    )

    return {
        isClearing,
        isDeleting,
        handleClearHistory,
        handleBatchDelete,
    }
}
