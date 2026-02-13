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

    // 中间提示文案
    let centerMessage: string | null = null

    if (isNoMatch) {
        centerMessage = '没有找到匹配的历史记录'
        if (hasMoreRecords) {
            centerMessage += '（未加载全部）'
        }
    }

    // 底部信息
    let info: string
    let hint = ''

    if (matchedCount !== -1) {
        info = `已匹配 ${matchedCount} 条`
        hint = hasMoreRecords ? ` · 已加载 ${loadedCount} / ${totalCount}` : ''
    } else {
        info = `已加载 ${loadedCount} / ${totalCount}`
    }

    return (
        <>
            {centerMessage && (
                <div className="flex items-center justify-center py-10 text-secondary text-sm italic">
                    {centerMessage}
                </div>
            )}

            <div className="pt-2 text-(sm secondary) border-t-base rounded flex items-center justify-end gap-2">
                <span>
                    {info}
                    {hint}
                </span>

                {hasMoreRecords && onLoadAll && (
                    <button type="button" className="btn" onClick={onLoadAll} disabled={isLoadingAll}>
                        {isLoadingAll ? '加载中...' : '加载全部'}
                    </button>
                )}
            </div>
        </>
    )
}
