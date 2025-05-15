import { SidebarEntry } from '@/components'
import { trackHistory } from '@/utils/history'
import '@/styles/global.css'

const App = () => {
    trackHistory()

    return (
        <>
            <SidebarEntry />
        </>
    )
}

export default App
