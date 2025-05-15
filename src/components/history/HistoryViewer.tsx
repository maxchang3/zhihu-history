import { Dialog } from '@/components/common'
import useDebouncedState from '@/hooks/useDebouncedState'
import Viewer from '@/styles/Viewer.module.css'
import { getHistory } from '@/utils/history'
import { searchItem } from '@/utils/search'
import { type FC, useMemo, useRef } from 'react'
import { HistoryItem } from './HistoryItem'
import { SearchBox } from './SearchBox'
import { SearchStatus } from './SearchStatus'

interface HistoryViewerProps {
    isOpen: boolean
    onClose: () => void
}

export const HistoryViewer: FC<HistoryViewerProps> = ({ isOpen, onClose }) => {
    const [searchTerm, debouncedValue, setSearchTerm] = useDebouncedState('', 300)

    const historyItems = getHistory()

    const matchedItems = useMemo(() => searchItem(historyItems, debouncedValue), [historyItems, debouncedValue])

    const firstItemRef = useRef<HTMLAnchorElement>(null)

    return (
        <Dialog isOpen={isOpen} onClose={onClose} initialFocusRef={firstItemRef}>
            <header className={Viewer.header}>
                <h2 className={Viewer.title}>浏览历史</h2>
                <SearchBox searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            </header>
            <div className={Viewer.body}>
                <SearchStatus totalCount={historyItems.length} matchedCount={searchTerm ? matchedItems.size : -1} />
                <ul className={Viewer.list}>
                    {historyItems.map((item, i) => {
                        // 搜索状态下，只渲染匹配的项
                        const isMatch = !searchTerm || matchedItems.has(i)
                        if (!isMatch) return null

                        return (
                            <HistoryItem
                                key={item.itemId}
                                item={item}
                                searchResult={matchedItems.get(i)}
                                ref={i === 0 ? firstItemRef : null}
                            />
                        )
                    })}
                </ul>
            </div>
        </Dialog>
    )
}
