import styles from '@/styles/History.module.css'
import { type ZhihuContent, getHistory } from '@/utils/history'
import { type FC, forwardRef, useEffect, useRef } from 'react'

interface HistoryDialogProps {
    isOpen: boolean
    onClose: () => void
}

interface HistoryItemProps {
    item: ZhihuContent
}

const HistoryItem = forwardRef<HTMLAnchorElement, HistoryItemProps>(({ item }, ref) => {
    const itemTypeClass = styles[item.type]
    const chineseType = {
        answer: '问题',
        article: '文章',
        pin: '想法',
    } satisfies Record<ZhihuContent['type'], string>

    return (
        <li className={styles.historyItem}>
            <a href={item.url} className={`${styles.link} ${itemTypeClass}`} ref={ref}>
                <span className={styles.srOnly}>{chineseType[item.type]}</span>
                {item.title}
                <span className={styles.srOnly}>作者：{item.authorName}</span>
            </a>
            <span className={styles.authorInfo} aria-hidden tabIndex={-1}>
                {item.authorName}
            </span>
        </li>
    )
})

export const HistoryDialog: FC<HistoryDialogProps> = ({ isOpen, onClose }) => {
    const historyItems = getHistory()
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

    return (
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
                    {/**
                     * 适配知乎增强（https://greasyfork.org/scripts/419081）
                     * 知乎增强的快捷关闭悬浮评论使用 `button[aria-label="关闭"]` 匹配关闭按钮
                     * 此处我们设置 `aria-label="关闭历史记录"` 来避免冲突
                     */}
                    <button
                        type="button"
                        className={styles.closeButton}
                        aria-label="关闭历史记录"
                        onClick={handleClose}
                    >
                        ✕
                    </button>
                </header>
                <div className={styles.dialogBody}>
                    {historyItems.length > 0 ? (
                        <ul className={styles.historyList}>
                            {historyItems.map((item, i) => (
                                <HistoryItem key={item.itemId} item={item} ref={i === 0 ? firstItemRef : null} />
                            ))}
                        </ul>
                    ) : (
                        <div className={styles.emptyState}>暂无浏览历史</div>
                    )}
                </div>
            </div>
        </dialog>
    )
}
