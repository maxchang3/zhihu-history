import { logger } from '@/utils/logger'
import { useEffect } from 'react'
import { type ZhihuContent, saveHistory } from './useHistory'

export const useHistoryTracker = () => {
    useEffect(() => {
        const bindEvent = (el: HTMLElement) => {
            el.addEventListener('click', onClick, { once: true })
        }

        const onClick = (e: Event) => {
            const target = e.target as HTMLElement
            const item = target.closest('.ContentItem') as HTMLElement
            if (!item) return

            const zop = item.dataset.zop
            if (!zop) {
                logger.error('无法读取回答或文章信息')
                return
            }

            try {
                const data: ZhihuContent = JSON.parse(zop)
                const link = item.querySelector<HTMLAnchorElement>('.ContentItem-title a')
                if (link) data.url = link.href
                saveHistory(data)
            } catch (err) {
                logger.error('解析历史记录失败:', err)
            }
        }

        // 初始绑定现有的 .ContentItem
        document.querySelectorAll<HTMLElement>('.ContentItem').forEach(bindEvent)

        // 监听后续添加的 .ContentItem
        const container = document.querySelector('.Topstory-recommend')
        if (!container) return

        const observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
                m.addedNodes.forEach((node) => {
                    if (!(node instanceof HTMLElement)) return
                    const item = node.querySelector?.('.ContentItem')
                    if (item) bindEvent(item as HTMLElement)
                })
            }
        })

        observer.observe(container, { childList: true, subtree: true })

        return () => observer.disconnect()
    }, [])
}
