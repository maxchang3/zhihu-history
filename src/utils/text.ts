/**
 * 截取文本，如果超过指定长度则添加省略号
 * @param text 要截取的文本
 * @param maxLength 最大长度，默认为120
 * @returns 截取后的文本，如果超长则添加 "..."
 */
export const truncateText = (text: string, maxLength = 120): string => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}
