import type { ChangeEvent, FC, Ref } from 'react'
import { forwardRef } from 'react'
import Search from '@/styles/Search.module.css'

interface SearchBoxProps {
    searchTerm: string
    onSearchChange: (term: string) => void
    placeholder?: string
}

export const SearchBox: FC<SearchBoxProps & { ref?: Ref<HTMLInputElement> }> = forwardRef(
    ({ searchTerm, onSearchChange, placeholder = '搜索历史记录' }, ref) => {
        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            onSearchChange(e.target.value)
        }

        const clearSearch = () => {
            onSearchChange('')
        }

        return (
            <div className={Search.container}>
                <input
                    ref={ref}
                    type="text"
                    placeholder={placeholder}
                    className={Search.input}
                    value={searchTerm}
                    onChange={handleChange}
                    aria-label={placeholder}
                    style={{ backgroundColor: 'transparent' }}
                    tabIndex={0}
                />
                {searchTerm && (
                    <button
                        type="button"
                        className={Search.clearButton}
                        onClick={clearSearch}
                        aria-label="清除搜索"
                        tabIndex={-1}
                    >
                        ✕
                    </button>
                )}
            </div>
        )
    }
)

SearchBox.displayName = 'SearchBox'
