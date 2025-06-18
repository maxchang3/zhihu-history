import type { FC } from 'react'
import Search from '@/styles/Search.module.css'

interface SearchStatusProps {
    /**
     * 总历史记录数量
     */
    totalCount: number
    /**
     * 匹配结果数量（ `-1` 表示没有搜索词）
     */
    matchedCount: number
}

export const SearchStatus: FC<SearchStatusProps> = ({ totalCount, matchedCount }) => {
    // 无历史记录情况
    if (totalCount === 0) return <div className={Search.emptyState}>暂无浏览历史</div>

    // 有搜索词的情况
    if (matchedCount !== -1) {
        // 搜索无结果
        if (matchedCount === 0) return <div className={Search.emptyState}>没有找到匹配的历史记录</div>
        // 有搜索结果
        return <div className={Search.info}>找到 {matchedCount} 条匹配结果</div>
    }

    // 无搜索词时不显示状态
    return null
}
