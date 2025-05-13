import styles from '@/styles/History.module.css'
import type { ChangeEvent, FC } from 'react'

interface SearchBoxProps {
    searchTerm: string
    onSearchChange: (term: string) => void
    placeholder?: string
}

export const SearchBox: FC<SearchBoxProps> = ({ searchTerm, onSearchChange, placeholder = '搜索历史记录' }) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value)
    }

    const clearSearch = () => {
        onSearchChange('')
    }

    return (
        <div className={styles.searchContainer}>
            <input
                type="text"
                placeholder={placeholder}
                className={styles.searchInput}
                value={searchTerm}
                onChange={handleChange}
                aria-label={placeholder}
            />
            {searchTerm && (
                <button type="button" className={styles.clearSearchButton} onClick={clearSearch} aria-label="清除搜索">
                    ✕
                </button>
            )}
        </div>
    )
}
