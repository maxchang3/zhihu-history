import type { FC } from 'react'

interface ClockIconProps {
    title?: string
}

export const ClockIcon: FC<ClockIconProps> = ({ title = '最近浏览' }) => {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" className="ZDI ZDI--ClockFill24" fill="currentColor">
            <title>{title}</title>
            <path
                fillRule="evenodd"
                d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Zm3.84-7.35a.75.75 0 0 1-1.025.274l-3.185-1.839-.018-.01a.746.746 0 0 1-.362-.658V8.75a.75.75 0 1 1 1.5 0V12l2.815 1.625a.75.75 0 0 1 .274 1.024Z"
                clipRule="evenodd"
            ></path>
        </svg>
    )
}
