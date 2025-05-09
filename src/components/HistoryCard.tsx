import styles from '@/styles//History.module.css'
import { type FC, useEffect, useState } from 'react'
import { HistoryDialog } from './HistoryDialog'

export const HistoryCard: FC = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement
            const isEditableTarget =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable ||
                target.tagName === 'SELECT'
            if (event.key === 'h' && !isEditableTarget) {
                setIsDialogOpen((prev) => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    return (
        <div className={styles.historyCard} role="complementary">
            <button
                className={styles.historyButton}
                onClick={() => setIsDialogOpen(true)}
                aria-label="历史记录,打开后按 Esc 关闭"
                aria-haspopup="dialog"
                type="button"
            >
                <span>历史记录</span>
            </button>
            <HistoryDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
        </div>
    )
}
