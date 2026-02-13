import { type FC, useCallback, useEffect, useRef, useState } from 'react'
import { Dialog, SearchIcon } from '@/components/ui'
import {
    useHistoryData,
    useHistoryKeyHandlers,
    useHistoryOperations,
    useHistorySearch,
    useHistorySelection,
    useHistoryStats,
} from '@/hooks'
import { HistoryItem, SearchBox, type SearchBoxHandle, SearchStatus } from '.'

interface HistoryViewerProps {
    isOpen: boolean
    onClose: () => void
}

export const HistoryViewer: FC<HistoryViewerProps> = ({ isOpen, onClose }) => {
    const [isSearchVisible, setIsSearchVisible] = useState(false)

    const bodyRef = useRef<HTMLDivElement>(null)
    const searchBoxRef = useRef<SearchBoxHandle>(null)

    const {
        historyItems,
        loading,
        loadingMore,
        isLoadingAll,
        error,
        hasMore,
        loadHistory,
        loadAllHistory,
        handleLoadMore,
        clearHistoryItems,
        setHistoryItems,
    } = useHistoryData()

    const { stats, loadStats, updateStatsCount, setStats } = useHistoryStats()

    const { selectedItems, isBatchMode, toggleItemSelect, toggleBatchMode, toggleSelectAll, clearSelection } =
        useHistorySelection(historyItems)

    const { isClearing, isDeleting, handleClearHistory, handleBatchDelete } = useHistoryOperations()

    const { searchTerm, matchedItems, setSearchTerm } = useHistorySearch(historyItems)

    // 键盘快捷键处理
    useHistoryKeyHandlers(
        isOpen,
        isSearchVisible,
        () => setIsSearchVisible(!isSearchVisible),
        () => searchBoxRef.current?.clear(),
        () => bodyRef.current?.focus(),
        () => searchBoxRef.current?.focus()
    )

    // 加载历史记录和重置搜索状态
    useEffect(() => {
        if (isOpen) {
            loadHistory()
            loadStats()
            setIsSearchVisible(false)
            setSearchTerm('')

            setTimeout(() => {
                if (bodyRef.current) bodyRef.current.focus()
            }, 0)
        }
    }, [isOpen, loadHistory, loadStats, setSearchTerm])

    // 处理清空历史记录
    const handleClear = useCallback(async () => {
        await handleClearHistory(() => {
            clearHistoryItems()
            setStats((prev) => ({ ...prev, count: 0 }))
            clearSelection()
        })
    }, [handleClearHistory, clearHistoryItems, setStats, clearSelection])

    // 处理批量删除
    const handleBatchDeleteItems = useCallback(async () => {
        await handleBatchDelete(historyItems, selectedItems, (deletedCount) => {
            setHistoryItems((prev) => prev.filter((item) => !selectedItems.has(item.data.extra.content_token)))
            updateStatsCount(-deletedCount)
            clearSelection()
        })
    }, [handleBatchDelete, historyItems, selectedItems, setHistoryItems, updateStatsCount, clearSelection])

    // 滚动到底部自动加载更多
    const handleScroll = useCallback(() => {
        if (bodyRef.current && !loading && !loadingMore && hasMore) {
            const { scrollTop, clientHeight, scrollHeight } = bodyRef.current
            if (scrollTop + clientHeight >= scrollHeight - 50) {
                loadHistory(historyItems.length, true)
            }
        }
    }, [loading, loadingMore, hasMore, historyItems.length, loadHistory])

    useEffect(() => {
        const bodyElement = bodyRef.current
        if (bodyElement) {
            bodyElement.addEventListener('scroll', handleScroll)
            return () => bodyElement.removeEventListener('scroll', handleScroll)
        }
    }, [handleScroll])

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onOpen={() => {
                // 确保 DOM 已经渲染后再设置焦点
                setTimeout(() => {
                    if (bodyRef.current) {
                        bodyRef.current.focus()
                    }
                }, 0)
            }}
        >
            <header className="flex justify-between items-center mb-2 border-b-base pb-2">
                <h2 className="m-0 text-lg text-primary">最近浏览</h2>
                <SearchBox
                    ref={searchBoxRef}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    isVisible={isSearchVisible}
                />
                {/* 顶部操作栏 */}
                <div className="flex gap-1 items-center mt-1" role="toolbar" aria-label="历史记录操作">
                    {!isBatchMode ? (
                        <>
                            <button
                                type="button"
                                className="btn"
                                onClick={() => setIsSearchVisible(!isSearchVisible)}
                                aria-label={isSearchVisible ? '关闭搜索' : '搜索历史记录'}
                                title={isSearchVisible ? '关闭搜索' : '搜索历史记录'}
                            >
                                <SearchIcon title={isSearchVisible ? '关闭搜索' : '搜索历史记录'} />
                            </button>
                            <button
                                type="button"
                                className="btn"
                                onClick={toggleBatchMode}
                                disabled={historyItems.length === 0}
                                aria-label="批量删除"
                                title="批量删除"
                            >
                                批量删除
                            </button>
                            <button
                                type="button"
                                className="btn"
                                onClick={handleClear}
                                disabled={isClearing || historyItems.length === 0}
                                aria-label="清空记录"
                                title="清空记录"
                            >
                                清空记录
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="btn"
                                onClick={toggleSelectAll}
                                disabled={historyItems.length === 0}
                                aria-label={selectedItems.size === historyItems.length ? '取消全选' : '全选'}
                                title={selectedItems.size === historyItems.length ? '取消全选' : '全选'}
                            >
                                {selectedItems.size === historyItems.length ? '取消全选' : '全选'}
                            </button>
                            <button
                                type="button"
                                className="btn"
                                onClick={handleBatchDeleteItems}
                                disabled={isDeleting || selectedItems.size === 0}
                                aria-label={`删除选中的 ${selectedItems.size} 条记录`}
                                title={`删除选中的 ${selectedItems.size} 条记录`}
                            >
                                删除 ({selectedItems.size}/{historyItems.length})
                            </button>
                            <button
                                type="button"
                                className="btn"
                                onClick={toggleBatchMode}
                                disabled={isDeleting}
                                aria-label="取消批量删除"
                                title="取消批量删除"
                            >
                                取消
                            </button>
                        </>
                    )}
                </div>
            </header>
            {/** biome-ignore lint/a11y/noNoninteractiveTabindex: use for focus management */}
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar" ref={bodyRef} tabIndex={0}>
                {loading && <div className="text-center py-8 text-secondary">加载中...</div>}
                {error && <div className="text-center py-8 text-red-(500 dark:400)">{error}</div>}
                {!loading && !error && historyItems.length === 0 && (
                    <div className="text-center py-8 text-secondary">暂无最近浏览</div>
                )}
                {!loading && !error && historyItems.length > 0 && (
                    <>
                        <ul className="m-0 flex flex-col p-0 sm:px-6">
                            {historyItems.map((item, i) => {
                                const isMatch = !searchTerm || matchedItems.has(i)
                                if (!isMatch) return null

                                const isSelected = selectedItems.has(item.data.extra.content_token)

                                return (
                                    <HistoryItem
                                        key={item.data.extra.content_token}
                                        item={item}
                                        searchResult={matchedItems.get(i)}
                                        isSelected={isSelected}
                                        onToggleSelect={
                                            isBatchMode
                                                ? () => toggleItemSelect(item.data.extra.content_token)
                                                : undefined
                                        }
                                    />
                                )
                            })}
                        </ul>
                        {loadingMore && <div className="text-center py-8 text-gray-(500 dark:400)">加载更多...</div>}
                        {hasMore && !loadingMore && !searchTerm && (
                            <button type="button" className="btn btn-lg mx-auto my-2" onClick={handleLoadMore}>
                                加载更多
                            </button>
                        )}
                        {!hasMore && !loadingMore && !searchTerm && (
                            <div className="text-center py-8 text-gray-(500 dark:400) text-sm">已加载全部历史记录</div>
                        )}
                    </>
                )}
            </div>
            {/* 底部信息条 */}
            {historyItems.length > 0 && (
                <SearchStatus
                    totalCount={stats.count}
                    loadedCount={historyItems.length}
                    matchedCount={searchTerm ? matchedItems.size : -1}
                    isLoadingAll={isLoadingAll}
                    onLoadAll={loadAllHistory}
                />
            )}
        </Dialog>
    )
}
