import { HistoryItem } from '@/components/HistoryItem'
import { SearchBox } from '@/components/SearchBox'
import { SearchStatus } from '@/components/SearchStatus'
import useDebouncedState from '@/hooks/useDebouncedState'
import styles from '@/styles/History.module.css'
import { getHistory } from '@/utils/history'
import { searchItem } from '@/utils/search'
import { type FC, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'

interface HistoryDialogProps {
    isOpen: boolean
    onClose: () => void
}

export const HistoryDialog: FC<HistoryDialogProps> = ({ isOpen, onClose }) => {
    const [searchTerm, debouncedValue, setSearchTerm] = useDebouncedState('', 300)

    const historyItems = getHistory()

    const matchedItems = useMemo(() => searchItem(historyItems, debouncedValue), [historyItems, debouncedValue])

    const dialogRef = useRef<HTMLDialogElement>(null)
    const firstItemRef = useRef<HTMLAnchorElement>(null)

    useEffect(() => {
        const dialogElement = dialogRef.current
        if (!dialogElement) return
        if (isOpen) {
            dialogElement.showModal()
            document.body.style.overflow = 'hidden'
            firstItemRef.current?.focus()
        } else if (dialogElement.open) {
            dialogElement.close()
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const handleClose = () => {
        onClose()
    }

    return createPortal(
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            onClose={handleClose}
            onClick={(e) => {
                if (e.target === dialogRef.current) {
                    handleClose()
                }
            }}
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    handleClose()
                }
            }}
        >
            <div className={styles.dialogContent}>
                <header className={styles.dialogHeader}>
                    <h2 className={styles.dialogTitle}>浏览历史</h2>
                    <SearchBox searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                </header>
                <div className={styles.dialogBody}>
                    <SearchStatus totalCount={historyItems.length} matchedCount={searchTerm ? matchedItems.size : -1} />
                    <ul className={styles.historyList}>
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
            </div>
        </dialog>,
        document.body
    )
}
