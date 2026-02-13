import { useMemo } from 'react'
import useDebouncedState from '@/hooks/useDebouncedState'
import { searchItem } from '@/services/search'
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
