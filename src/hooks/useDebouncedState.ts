import { useEffect, useState } from 'react'
import { debounce } from 'throttle-debounce'

export default function useDebouncedState<T>(initialValue: T, delay = 300): [T, T, (val: T) => void] {
    const [value, setValue] = useState<T>(initialValue)
    const [debouncedValue, setDebouncedValue] = useState<T>(initialValue)

    useEffect(() => {
        const handler = debounce(delay, setDebouncedValue, {
            atBegin: true,
        })
        handler(value)
        return () => {
            handler.cancel?.()
        }
    }, [value, delay])

    return [value, debouncedValue, setValue]
}
