import type { FC } from 'react'

interface SearchIconProps {
    title?: string
}

export const SearchIcon: FC<SearchIconProps> = ({ title = '搜索' }) => {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" role="img">
            <title>{title}</title>
            <path
                fillRule="evenodd"
                d="M10.218 11.632a5.5 5.5 0 1 1 1.414-1.414l2.075 2.075a1 1 0 0 1-1.414 1.414l-2.075-2.075ZM10.6 7.1a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
            ></path>
        </svg>
    )
}
