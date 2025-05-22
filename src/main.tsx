import { GM_info } from '$'
import App from '@/App'
import { trackHistory } from '@/utils/history'
import { logger } from '@/utils/logger'
import { registerMenuCommands } from '@/utils/menu'
import { getPageType } from '@/utils/route'
import ReactDOM from 'react-dom'

console.log(
    '%c知乎历史记录',
    'color:#1772F6; font-weight:bold; font-size:3em; padding:5px; text-shadow:1px 1px 3px rgba(0,0,0,0.7)'
)

trackHistory()

const mountApp = () => {
    const container = document.createElement('div')
    container.id = 'zh-history-root'

    const getMountPointSelector = () => {
        const pageType = getPageType(location.pathname)
        switch (pageType) {
            case 'home':
                return '.CreatorEntrance'
            case 'search':
                return '.TopSearch'
            case 'topic':
                return '.NumberBoard'
            default:
                return null
        }
    }
    const selector = getMountPointSelector()

    if (!selector) {
        logger.log(`当前页面类型不支持挂载：${location.pathname}`)
        return
    }

    const target = document.querySelector(selector)?.parentElement

    if (!target) {
        logger.warn(`未找到挂载点：${selector}`)
        return
    }

    target.insertBefore(container, target.firstChild)

    ReactDOM.render(<App />, container)
}

mountApp()
registerMenuCommands()

logger.log(`初始化成功，版本：${GM_info.script.version}`)
