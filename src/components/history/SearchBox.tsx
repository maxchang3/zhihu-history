import type { ChangeEvent, ForwardRefRenderFunction } from 'react'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'

export interface SearchBoxHandle {
    focus: () => void
    clear: () => void
}

interface SearchBoxProps {
    searchTerm: string
    onSearchChange: (term: string) => void
    placeholder?: string
    isVisible?: boolean
}

const SearchBoxImpl: ForwardRefRenderFunction<SearchBoxHandle, SearchBoxProps> = (
    { searchTerm, onSearchChange, placeholder = '搜索历史记录', isVisible = false },
    ref
) => {
    const inputRef = useRef<HTMLInputElement>(null)

    /* 输入变化 */
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value)
    }

    /* 清空 */
    const clear = useCallback(() => {
        onSearchChange('')
    }, [onSearchChange])

    /* isVisible 时自动 focus */
    useEffect(() => {
        if (isVisible) {
            inputRef.current?.focus()
        }
    }, [isVisible])

    /* 向父组件暴露命令式 API */
    useImperativeHandle(
        ref,
        () => ({
            focus: () => {
                inputRef.current?.focus()
            },
            clear,
        }),
        [clear]
    )

    if (!isVisible) return null

    return (
        <div className="relative flex-1 mx-4 flex items-center">
            <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                className={
                    'flex-1 w-full p-1 rd text-sm border-base focus:(outline-none ring-2 ring-blue-500 dark:ring-blue-400 outline-none)'
                }
                value={searchTerm}
                onChange={handleChange}
                aria-label={placeholder}
                tabIndex={-1}
            />

            {searchTerm && (
                <button
                    type="button"
                    className="absolute right-1 bg-transparent border-none cursor-pointer text-secondary text-xs p-1 flex items-center justify-center rounded-full transition-colors hover:(bg-gray-200 dark:bg-gray-700)"
                    onClick={clear}
                    aria-label="清除搜索"
                    tabIndex={-1}
                >
                    ✕
                </button>
            )}
        </div>
    )
}

export const SearchBox = forwardRef(SearchBoxImpl)
