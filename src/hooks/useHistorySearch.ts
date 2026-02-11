import { useMemo } from 'react'
import { searchItem } from '@/features/search'
import useDebouncedState from '@/hooks/useDebouncedState'
import type { HistoryItemType } from '@/types'

export const useHistorySearch = (historyItems: HistoryItemType[]) => {
    const [searchTerm, debouncedValue, setSearchTerm] = useDebouncedState('', 300)

    const matchedItems = useMemo(() => searchItem(historyItems, debouncedValue), [historyItems, debouncedValue])

    return {
        searchTerm,
        debouncedValue,
        matchedItems,
        setSearchTerm,
    }
}
