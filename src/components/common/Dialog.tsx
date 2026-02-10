import { type FC, type ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface DialogProps {
    isOpen: boolean
    onClose: () => void
    children: ReactNode
    className?: string
    onOpen?: () => void
}

export const Dialog: FC<DialogProps> = ({ isOpen, onClose, children, className = '', onOpen }) => {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialogElement = dialogRef.current
        if (!dialogElement) return

        if (isOpen) {
            dialogElement.showModal()
            document.body.style.overflow = 'hidden'
            if (onOpen) {
                onOpen()
            }
        } else if (dialogElement.open) {
            dialogElement.close()
            document.body.style.overflow = ''
        }
    }, [isOpen, onOpen])

    const handleClose = () => {
        onClose()
    }

    return createPortal(
        <dialog
            ref={dialogRef}
            aria-modal="true"
            aria-labelledby="dialog-title"
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
            className={`select-text! border-none shadow rounded-lg overflow-hidden max-w-3xl w-full sm:w-4/5 ${className}`}
        >
            <div className="p-2 outline-none">{children}</div>
        </dialog>,
        document.body
    )
}
