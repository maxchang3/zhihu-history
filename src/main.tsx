import { GM_info } from '$'
import App from '@/App'
import { trackHistory } from '@/utils/history'
import { logger } from '@/utils/logger'
import { registerMenuCommands } from '@/utils/menu'
import ReactDOM from 'react-dom'

console.log(
    '%c知乎历史记录',
    'color:#1772F6; font-weight:bold; font-size:3em; padding:5px; text-shadow:1px 1px 3px rgba(0,0,0,0.7)'
)

trackHistory()

const mountApp = () => {
    const container = document.createElement('div')
    container.id = 'zh-history-root'

    const target =
        document.querySelector('.CreatorEntrance')?.parentElement || // 右上角的创作者中心入口
        document.querySelector('.TopSearch')?.parentElement // 搜索页的边栏

    if (!target) {
        logger.warn('未找到挂载点')
        return
    }

    target.insertBefore(container, target.firstChild)

    ReactDOM.render(<App />, container)
}

mountApp()
registerMenuCommands()

logger.log(`初始化成功，版本：${GM_info.script.version}`)
