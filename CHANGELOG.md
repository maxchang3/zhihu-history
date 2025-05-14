# Changelog

## 1.1.1
### Fixes

- 修复在知乎美化中开启「宽屏显示」时历史记录面板无法显示的问题（通过 `createPortal` 将 `HistoryDialog` 直接挂载到 `body` 元素上）

## 1.1.0
### Features

- 记录浏览内容的部分正文、访问时的时间戳
- 支持搜索历史记录（简易分词+匹配）

### Bug Fixes
- 改善无障碍

### Changes

- 移除了关闭按钮

## 1.0.3
### Features

- 添加对「想法」历史记录的支持
- 使用 <kbd>H</kbd> 键切换对话框开关状态
- 无障碍性改进:
    - 添加聚焦样式，默认聚焦第一个链接
    - 增强屏幕阅读器支持和改进 aria 标签

### Bug Fixes

- 修复标签页切换时元素引用问题，使用更高级别的选择器


## 1.0.2

## Features

- 添加打开历史记录面板快捷键（<kbd>H</kbd>）
- 为弹出层和背景添加过渡效果
  
## Bug Fixes

- 更新 URL 匹配模式
- 修改关闭按钮的 aria-label 以避免与 [知乎增强](https://greasyfork.org/scripts/419081) 冲突

## 1.0.1

### Bug Fixes

- 点击事件取消了 `once` 限制，确保每次点击都能更新历史记录顺序

## 1.0.0

### Features
- 支持清空历史记录
- 支持设置历史记录数量上限
- 优化整体 UI 样式

### Refactors
- 使用 [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) 进行工程化开发
- 使用 React 重构，直接复用知乎网页版已挂载的 React 和 ReactDOM，无需额外依赖


## v0.1 ~ v0.6 (legacy)

- 基本功能实现
- 重构、整理代码逻辑

