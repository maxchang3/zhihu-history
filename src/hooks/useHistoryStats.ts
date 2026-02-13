import { useCallback, useState } from 'react'
import { getHistoryStats } from '@/services/api'
import { logger } from '@/utils'

export const useHistoryStats = () => {
    const [stats, setStats] = useState({ count: 0 })

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

    const updateStatsCount = useCallback((delta: number) => {
        setStats((prev) => ({ ...prev, count: Math.max(0, prev.count + delta) }))
    }, [])

    return {
        stats,
        loadStats,
        updateStatsCount,
        setStats,
    }
}
