import { HistoryCard } from '@/components/HistoryCard'
import { useHistoryTracker } from '@/hooks/useHistoryTracker'

const App = () => {
    useHistoryTracker()

    return (
        <>
            <HistoryCard />
        </>
    )
}

export default App
