import { HistoryCard } from '@/components/HistoryCard'
import { trackHistory } from '@/utils/history'

const App = () => {
    trackHistory()

    return (
        <>
            <HistoryCard />
        </>
    )
}

export default App
