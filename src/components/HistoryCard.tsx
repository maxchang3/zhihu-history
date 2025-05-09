import styles from '@/styles//History.module.css'
import { type FC, useEffect, useState } from 'react'
import { HistoryDialog } from './HistoryDialog'

export const HistoryCard: FC = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleOpenDialog = () => setIsDialogOpen(true)
    const handleCloseDialog = () => setIsDialogOpen(false)

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement
            const isEditableTarget =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable ||
                target.tagName === 'SELECT'
            if (event.key === 'h' && !isEditableTarget) {
                setIsDialogOpen(true)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    return (
        <div className={styles.historyCard}>
            <button className={styles.historyButton} onClick={handleOpenDialog} aria-label="查看历史记录" type="button">
                历史记录
            </button>
            <HistoryDialog isOpen={isDialogOpen} onClose={handleCloseDialog} />
        </div>
    )
}
