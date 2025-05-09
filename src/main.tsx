import { GM_info } from '$'
import App from '@/App'
import { logger } from '@/utils/logger'
import { registerMenuCommands } from '@/utils/menu'
import ReactDOM from 'react-dom'

console.log(
    '%c知乎历史记录',
    'color:#1772F6; font-weight:bold; font-size:3em; padding:5px; text-shadow:1px 1px 3px rgba(0,0,0,0.7)'
)

const mountApp = () => {
    const container = document.createElement('div')
    container.id = 'zh-history-root'

    const target = document.querySelector('.Topstory-container > div:nth-child(2) > div:nth-child(2)')
    if (!target) {
        logger.warn('未找到挂载点')
        return
    }

    target.appendChild(container)

    ReactDOM.render(<App />, container)
}

mountApp()
registerMenuCommands()

logger.log(`初始化成功，版本：${GM_info.script.version}`)
