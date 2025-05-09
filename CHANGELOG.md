# Changelog


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

