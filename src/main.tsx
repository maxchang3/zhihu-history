import ReactDOM from 'react-dom'
import App from '@/App'
import { logger } from '@/utils/logger'
import { GM_info } from '$'

console.log(
    '%c知乎历史记录',
    'color:#1772F6; font-weight:bold; font-size:3em; padding:5px; text-shadow:1px 1px 3px rgba(0,0,0,0.7)'
)

const mountApp = () => {
    const container = document.createElement('div')
    container.id = 'zh-history-root'

    const target = document.querySelector('.css-1vbrp2j')

    if (!target) {
        logger.warn('未找到挂载点。')
        return
    }

    target.insertBefore(container, target.firstChild)

    ReactDOM.render(<App />, container)
}

mountApp()

logger.log(`初始化成功，版本：${GM_info.script.version}`)
