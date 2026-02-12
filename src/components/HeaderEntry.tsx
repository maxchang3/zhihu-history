import { type FC, useEffect, useState } from 'react'
import { ClockIcon } from '@/components/common'
import { HistoryViewer } from '@/components/history'

export const HeaderEntry: FC = () => {
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
                event.preventDefault()
                event.stopPropagation()
                setIsDialogOpen((prev) => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    return (
        <>
            <button
                className="css-16zsfw9 css-1osshgk"
                onClick={() => setIsDialogOpen(true)}
                aria-label="历史记录"
                id="history-button"
                aria-haspopup="true"
                aria-expanded={isDialogOpen}
                type="button"
            >
                <ClockIcon />
                <div className="css-vurnku">最近浏览</div>
            </button>
            <HistoryViewer isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
        </>
    )
}
