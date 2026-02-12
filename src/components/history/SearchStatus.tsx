import type { FC } from 'react'

interface SearchStatusProps {
    /**
     * 总历史记录数量
     */
    totalCount: number
    /**
     * 已加载的历史记录数量
     */
    loadedCount: number
    /**
     * 匹配结果数量（ `-1` 表示没有搜索词）
     */
    matchedCount: number
    /**
     * 是否正在加载所有记录
     */
    isLoadingAll?: boolean
    /**
     * 加载所有历史记录的回调
     */
    onLoadAll?: () => void
}

export const SearchStatus: FC<SearchStatusProps> = ({
    totalCount,
    loadedCount,
    matchedCount,
    isLoadingAll,
    onLoadAll,
}) => {
    // 无历史记录情况
    if (totalCount === 0) return <div className="text-center py-10 text-secondary text-sm italic">暂无最近浏览</div>

    // 搜索无结果情况
    if (matchedCount !== -1 && matchedCount === 0) {
        return <div className="text-center py-10 text-secondary text-sm italic">没有找到匹配的历史记录</div>
    }

    // 构建状态信息和按钮
    const getStatusContent = () => {
        let info: string
        let hint: string = ''

        if (matchedCount !== -1) {
            info = `找到 ${matchedCount} 条匹配结果`
            hint = loadedCount < totalCount ? `（仅搜索已加载的 ${loadedCount} 条）` : ''
        } else {
            info = `已加载 ${loadedCount} 条 / 共 ${totalCount} 条历史记录`
        }

        const hasMoreRecords = loadedCount < totalCount
        const shouldShowLoadAllButton = hasMoreRecords && onLoadAll

        return (
            <div className="px-4 py-2 text-sm text-secondary mt-2 rounded text-right sticky bottom-0 z-10 border-t-base">
                {info}
                {hint}
                {shouldShowLoadAllButton && (
                    <button
                        type="button"
                        className="ml-2 text-secondary hover:text-primary"
                        onClick={onLoadAll}
                        disabled={isLoadingAll}
                    >
                        {isLoadingAll ? '加载中...' : '全部加载'}
                    </button>
                )}
            </div>
        )
    }

    return getStatusContent()
}
