import styles from '@/styles//History.module.css'
import { type FC, useState } from 'react'
import { HistoryDialog } from './HistoryDialog'

export const HistoryCard: FC = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleOpenDialog = () => setIsDialogOpen(true)
    const handleCloseDialog = () => setIsDialogOpen(false)

    return (
        <div className={styles.historyCard}>
            <button className={styles.historyButton} onClick={handleOpenDialog} aria-label="查看历史记录" type="button">
                历史记录
            </button>
            <HistoryDialog isOpen={isDialogOpen} onClose={handleCloseDialog} />
        </div>
    )
}
