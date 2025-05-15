import styles from '@/styles/Dialog.module.css'
import { type FC, type ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface DialogProps {
    isOpen: boolean
    onClose: () => void
    children: ReactNode
    initialFocusRef?: React.RefObject<HTMLElement>
    className?: string
}

export const Dialog: FC<DialogProps> = ({ isOpen, onClose, children, initialFocusRef, className = '' }) => {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialogElement = dialogRef.current
        if (!dialogElement) return

        if (isOpen) {
            dialogElement.showModal()
            document.body.style.overflow = 'hidden'
            initialFocusRef?.current?.focus()
        } else if (dialogElement.open) {
            dialogElement.close()
            document.body.style.overflow = ''
        }
    }, [isOpen, initialFocusRef])

    const handleClose = () => {
        onClose()
    }

    return createPortal(
        <dialog
            ref={dialogRef}
            className={`${styles.dialog} ${className}`}
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
            <div className={styles.content}>{children}</div>
        </dialog>,
        document.body
    )
}
