import { useEffect } from 'react'

export const useHistoryKeyHandlers = (
    isOpen: boolean,
    isSearchVisible: boolean,
    onToggleSearch: () => void,
    onClearSearch: () => void,
    onFocusBody: () => void,
    onFocusSearch: () => void
) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return

            if (e.key === '/') {
                e.preventDefault()
                if (isSearchVisible) {
                    onClearSearch()
                    onToggleSearch()
                    onFocusBody()
                } else {
                    onFocusSearch()
                    onToggleSearch()
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, isSearchVisible, onToggleSearch, onClearSearch, onFocusBody, onFocusSearch])
}
