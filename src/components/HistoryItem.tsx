import styles from '@/styles/History.module.css'
import Item from '@/styles/Item.module.css'
import type { ZhihuContent } from '@/utils/history'
import { forwardRef } from 'react'

interface HistoryItemProps {
    item: ZhihuContent
}

/**
 * 格式化时间，临近时使用相对时间，远离时使用绝对时间
 */
const formatTime = (date: Date): string => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return '刚刚'
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
    return date.toLocaleDateString('zh-CN')
}

export const HistoryItem = forwardRef<HTMLAnchorElement, HistoryItemProps>(({ item }, ref) => {
    const chineseType = {
        answer: '问题',
        article: '文章',
        pin: '想法',
    } satisfies Record<ZhihuContent['type'], string>
    const visitTime = !item.visitTime ? null : new Date(item.visitTime)
    const formattedVisitTime = !visitTime
        ? null
        : {
              short: formatTime(visitTime),
              full: visitTime.toLocaleString('zh-CN'),
          }
    return (
        <li className={Item.item}>
            <a href={item.url} className={Item.link} ref={ref}>
                <span className={styles.srOnly}>{chineseType[item.type]}</span>
                <div className={Item.header}>
                    <span className={`${Item.title} ${Item[item.type]}`}>{item.title}</span>
                    <span className={Item.visitTime} title={formattedVisitTime?.full} aria-hidden tabIndex={-1}>
                        {formattedVisitTime?.short ?? item.authorName}
                    </span>
                </div>
                {
                    // 没有访问时间的是之前的历史记录，没有包含作者的 content，所以需要提示作者
                    !formattedVisitTime && <span className={styles.srOnly}>作者：{item.authorName}</span>
                }
                {formattedVisitTime && (
                    <span className={styles.srOnly}>
                        浏览于<time dateTime={formattedVisitTime.short}>{formattedVisitTime.short}</time>
                    </span>
                )}
            </a>
            {item.content && <p className={Item.content}>{item.content}</p>}
        </li>
    )
})
