import type { ChangeEvent, ForwardRefRenderFunction } from 'react'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import Search from '@/styles/Search.module.css'

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
        <div className={Search.container}>
            <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                className={Search.input}
                value={searchTerm}
                onChange={handleChange}
                aria-label={placeholder}
                style={{ backgroundColor: 'transparent' }}
            />

            {searchTerm && (
                <button
                    type="button"
                    className={Search.clearButton}
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
