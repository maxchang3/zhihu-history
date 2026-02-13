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
    if (totalCount === 0) {
        return <div className="text-center py-10 text-secondary text-sm italic">暂无最近浏览</div>
    }

    const hasMoreRecords = loadedCount < totalCount
    const isNoMatch = matchedCount === 0

    if (isNoMatch) {
        return (
            <div className="flex flex-col items-center py-10">
                <div className="text-secondary text-sm italic">没有找到匹配的历史记录</div>
                {hasMoreRecords && onLoadAll && (
                    <button
                        type="button"
                        className="mt-2 text-primary hover:underline text-sm"
                        onClick={onLoadAll}
                        disabled={isLoadingAll}
                    >
                        {isLoadingAll ? '正在搜索...' : `还有 ${totalCount - loadedCount} 条记录未加载，加载全部搜索`}
                    </button>
                )}
            </div>
        )
    }

    let info: string
    let hint: string = ''

    if (matchedCount !== -1) {
        info = `已匹配 ${matchedCount} 条`
        hint = hasMoreRecords ? ` · 已加载 ${loadedCount} / ${totalCount}` : ''
    } else {
        info = `已加载 ${loadedCount} / ${totalCount}`
    }

    return (
        <div className="px-4 py-2 text-sm text-secondary mt-2 rounded text-right sticky bottom-0 z-10 border-t-base bg-main">
            <span>
                {info}
                {hint}
            </span>
            {hasMoreRecords && onLoadAll && (
                <button
                    type="button"
                    className="ml-2 text-secondary hover:text-primary font-medium"
                    onClick={onLoadAll}
                    disabled={isLoadingAll}
                >
                    {isLoadingAll ? '加载中...' : '加载全部'}
                </button>
            )}
        </div>
    )
}
