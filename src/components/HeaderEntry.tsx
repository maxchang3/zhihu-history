import { type FC, useEffect, useState } from 'react'
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
                <svg width="16" height="16" viewBox="0 0 24 24" className="ZDI ZDI--ClockFill24" fill="currentColor">
                    <title>最近浏览</title>
                    <path
                        fillRule="evenodd"
                        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Zm3.84-7.35a.75.75 0 0 1-1.025.274l-3.185-1.839-.018-.01a.746.746 0 0 1-.362-.658V8.75a.75.75 0 1 1 1.5 0V12l2.815 1.625a.75.75 0 0 1 .274 1.024Z"
                        clipRule="evenodd"
                    ></path>
                </svg>
                <div className="css-vurnku">最近浏览</div>
            </button>
            <HistoryViewer isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
        </>
    )
}
