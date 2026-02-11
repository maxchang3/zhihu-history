import { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dialog } from '@/components/common'
import { batchDeleteHistory, clearHistory, fetchHistory, getHistoryStats } from '@/features/api'
import { searchItem } from '@/features/search'
import useDebouncedState from '@/hooks/useDebouncedState'
import type { HistoryItemType } from '@/types'
import { logger } from '@/utils/logger'
import { HistoryItem } from './HistoryItem'
import { SearchBox, type SearchBoxHandle } from './SearchBox'
import { SearchStatus } from './SearchStatus'

interface HistoryViewerProps {
    isOpen: boolean
    onClose: () => void
}

export const HistoryViewer: FC<HistoryViewerProps> = ({ isOpen, onClose }) => {
    const [searchTerm, debouncedValue, setSearchTerm] = useDebouncedState('', 300)
    const [isSearchVisible, setIsSearchVisible] = useState(false)
    const [historyItems, setHistoryItems] = useState<HistoryItemType[]>([])
    const [stats, setStats] = useState({ count: 0 })
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
    const [isClearing, setIsClearing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isBatchMode, setIsBatchMode] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    const bodyRef = useRef<HTMLDivElement>(null)
    const searchBoxRef = useRef<SearchBoxHandle>(null)

    const loadHistory = useCallback(async (offset = 0, isLoadMore = false) => {
        const currentLoadingState = isLoadMore ? setLoadingMore : setLoading
        currentLoadingState(true)
        setError(null)
        try {
            const result = await fetchHistory(offset, 50) // 每次加载 50 条
            if (result.isOk()) {
                const newItems = result.unwrap()
                if (isLoadMore) {
                    setHistoryItems((prev) => [...prev, ...newItems])
                } else {
                    setHistoryItems(newItems)
                }
                setHasMore(newItems.length === 50) // 如果返回的数量小于 50，说明没有更多数据了
            } else {
                const error = result.unwrapErr()
                setError(error)
                logger.error(error)
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : '加载历史记录失败'
            setError(errorMsg)
            logger.error(errorMsg)
        } finally {
            currentLoadingState(false)
        }
    }, [])

    const loadStats = useCallback(async () => {
        try {
            const result = await getHistoryStats()
            if (result.isOk()) {
                setStats(result.unwrap())
            } else {
                logger.error(result.unwrapErr())
            }
        } catch (err) {
            logger.error('获取统计信息失败:', err)
        }
    }, [])

    // 加载历史记录和重置搜索状态
    useEffect(() => {
        if (isOpen) {
            loadHistory()
            loadStats()
            setIsSearchVisible(false) // 每次打开对话框时重置搜索栏状态为关闭
            setSearchTerm('') // 清空搜索内容

            // 设置 bodyRef 的焦点
            setTimeout(() => {
                if (bodyRef.current) bodyRef.current.focus()
            }, 0)
        }
    }, [isOpen, loadHistory, loadStats, setSearchTerm])

    // 添加 / 快捷键支持搜索切换
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 只有在对话框打开时才处理快捷键
            if (!isOpen) return

            // 当按下 / 键时
            if (e.key === '/') {
                e.preventDefault()
                // 如果搜索框可见且焦点在搜索框上，清除搜索内容
                if (isSearchVisible) {
                    searchBoxRef.current?.clear()
                    setIsSearchVisible(false)
                    bodyRef.current?.focus()
                } else {
                    // 否则切换搜索框可见性
                    searchBoxRef.current?.focus()
                    setIsSearchVisible(true)
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, isSearchVisible])

    // 切换项目选择状态
    const toggleItemSelect = (contentToken: string) => {
        setSelectedItems((prev) => {
            const newSelected = new Set(prev)
            if (newSelected.has(contentToken)) {
                newSelected.delete(contentToken)
            } else {
                newSelected.add(contentToken)
            }
            return newSelected
        })
    }

    // 切换批量删除模式
    const toggleBatchMode = () => {
        setIsBatchMode((prev) => !prev)
        setSelectedItems(new Set())
    }

    // 全选/取消全选
    const toggleSelectAll = () => {
        if (selectedItems.size === historyItems.length) {
            setSelectedItems(new Set())
        } else {
            setSelectedItems(new Set(historyItems.map((item) => item.data.extra.content_token)))
        }
    }

    // 清空所有历史记录
    const handleClearHistory = async () => {
        if (!window.confirm('确定要清空所有最近浏览吗？此操作不可恢复。')) {
            return
        }

        setIsClearing(true)
        try {
            const result = await clearHistory()
            if (result.isOk()) {
                setHistoryItems([])
                setStats((prev) => ({ ...prev, count: 0 }))
                setSelectedItems(new Set())
            } else {
                logger.error(result.unwrapErr())
            }
        } catch (err) {
            logger.error('清空历史记录失败:', err)
        } finally {
            setIsClearing(false)
        }
    }

    // 批量删除选中的历史记录
    const handleBatchDelete = async () => {
        if (selectedItems.size === 0) {
            return
        }

        if (!window.confirm(`确定要删除选中的 ${selectedItems.size} 条历史记录吗？此操作不可恢复。`)) {
            return
        }

        setIsDeleting(true)
        try {
            const itemsToDelete = historyItems.filter((item) => selectedItems.has(item.data.extra.content_token))
            const result = await batchDeleteHistory({
                pairs: itemsToDelete.map((item) => ({
                    content_token: item.data.extra.content_token,
                    content_type: item.data.extra.content_type,
                })),
                clear: false,
            })

            if (result.isOk()) {
                // 删除成功后刷新列表
                setHistoryItems((prev) => prev.filter((item) => !selectedItems.has(item.data.extra.content_token)))
                setStats((prev) => ({ ...prev, count: Math.max(0, prev.count - selectedItems.size) }))
                setSelectedItems(new Set())
            } else {
                logger.error('删除失败:', result.unwrapErr())
            }
        } catch (err) {
            logger.error('批量删除失败:', err)
        } finally {
            setIsDeleting(false)
        }
    }

    const matchedItems = useMemo(() => searchItem(historyItems, debouncedValue), [historyItems, debouncedValue])

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

    // 加载更多按钮点击事件
    const handleLoadMore = useCallback(() => {
        loadHistory(historyItems.length, true)
    }, [historyItems.length, loadHistory])

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
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" role="img">
                                    <title>{isSearchVisible ? '关闭搜索' : '搜索历史记录'}</title>
                                    <path
                                        fillRule="evenodd"
                                        d="M10.218 11.632a5.5 5.5 0 1 1 1.414-1.414l2.075 2.075a1 1 0 0 1-1.414 1.414l-2.075-2.075ZM10.6 7.1a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                                        clip-rule="evenodd"
                                    ></path>
                                </svg>
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
                                onClick={handleClearHistory}
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
                                onClick={handleBatchDelete}
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
                {error && <div className="text-center py-8 text-red-500 dark:text-red-400">{error}</div>}
                {!loading && !error && historyItems.length === 0 && (
                    <div className="text-center py-8 text-secondary">暂无最近浏览</div>
                )}
                {!loading && !error && historyItems.length > 0 && (
                    <>
                        <ul className="list-none m-0 flex flex-col p-0 sm:px-6">
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
                        {loadingMore && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">加载更多...</div>
                        )}
                        {hasMore && !loadingMore && !searchTerm && (
                            <button type="button" className="btn btn-lg mx-auto my-2" onClick={handleLoadMore}>
                                加载更多
                            </button>
                        )}
                        {!hasMore && !loadingMore && !searchTerm && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                                已加载全部历史记录
                            </div>
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
                />
            )}
        </Dialog>
    )
}
