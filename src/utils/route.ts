export type PageType = 'home' | 'topic' | 'search'

/**
 * 根据当前路径判断页面类型
 */
export const getPageType = (pathname: string): PageType | null => {
    switch (pathname) {
        case '/':
        case '/follow':
        case '/hot':
        case '/column-square':
            return 'home'
        case '/search':
            return 'search'
        default:
            if (pathname.startsWith('/topic')) return 'topic'
            return null
    }
}
