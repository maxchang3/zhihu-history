import { useCallback, useState } from 'react'
import type { HistoryItemType } from '@/types'

export const useHistorySelection = (historyItems: HistoryItemType[]) => {
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
    const [isBatchMode, setIsBatchMode] = useState(false)

    const toggleItemSelect = useCallback((contentToken: string) => {
        setSelectedItems((prev) => {
            const newSelected = new Set(prev)
            if (newSelected.has(contentToken)) {
                newSelected.delete(contentToken)
            } else {
                newSelected.add(contentToken)
            }
            return newSelected
        })
    }, [])

    const toggleBatchMode = useCallback(() => {
        setIsBatchMode((prev) => !prev)
        setSelectedItems(new Set())
    }, [])

    const toggleSelectAll = useCallback(() => {
        if (selectedItems.size === historyItems.length) {
            setSelectedItems(new Set())
        } else {
            setSelectedItems(new Set(historyItems.map((item) => item.data.extra.content_token)))
        }
    }, [selectedItems.size, historyItems])

    const clearSelection = useCallback(() => {
        setSelectedItems(new Set())
    }, [])

    const removeSelectedItems = useCallback((itemsToRemove: Set<string>) => {
        setSelectedItems((prev) => {
            const newSelected = new Set(prev)
            itemsToRemove.forEach((token) => {
                newSelected.delete(token)
            })
            return newSelected
        })
    }, [])

    return {
        selectedItems,
        isBatchMode,
        toggleItemSelect,
        toggleBatchMode,
        toggleSelectAll,
        clearSelection,
        removeSelectedItems,
        setSelectedItems,
    }
}
