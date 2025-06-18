import { type FC, useEffect, useState } from 'react'
import { HistoryViewer } from '@/components/history'
import styles from '@/styles//Sidebar.module.css'

export const SidebarEntry: FC = () => {
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
        <aside className={styles.historyCard}>
            <button
                className={styles.historyButton}
                onClick={() => setIsDialogOpen(true)}
                aria-label="历史记录,打开后按 Esc 关闭"
                aria-haspopup="dialog"
                type="button"
            >
                <span>历史记录</span>
            </button>
            <HistoryViewer isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
        </aside>
    )
}
