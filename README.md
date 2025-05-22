<p align="center">
  <img src="https://github.com/user-attachments/assets/817d91da-4f26-40e0-8a1f-7905bfb8a199" width="50%" />
</p>

# 知乎历史记录

![Greasy Fork 总下载量](https://img.shields.io/greasyfork/dt/459852?style=flat-square&color=444)
![GitHub Release](https://img.shields.io/github/v/release/maxchang3/zhihu-history?style=flat-square&color=444)
![](https://img.shields.io/badge/安装方式:-777)
[![从 Greasy Fork 安装](https://img.shields.io/badge/Greasy_Fork-7D160D)](https://greasyfork.org/scripts/459852) [![从 Github Release 安装](https://img.shields.io/badge/Github_Release-3D7D3F)](https://github.com/maxchang3/zhihu-history/releases/latest/download/zhihu-history.user.js)


刷知乎网页版时，最痛苦的事情可能就是：当你正在看一个回答时，因为各种意外刷新了，接着，你就再也找不到它了。🤮

某一天，当我又一次深恶痛绝时，最终写下了这个脚本。

最近又想起来，使用 [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) + React 进行重构。

## 特点

> _~~「妈妈再也不用担心我找不到回答了」~~_

- 记录在知乎上浏览过的「文章」、「回答」、「想法」等内容
  - 同时记录部分正文与访问时间
  - 简单搜索（使用 `Intl.Segmenter` 分词）
  - 目前支持：首页、搜索页、话题页
- 无需额外依赖，复用知乎页面已挂载的 `React` 和 `ReactDOM`
- *所有数据存储在本地*

## 快捷键

- <kbd>H</kbd> - 打开/关闭历史记录面板


## 无障碍

### 目前特性

> [!CAUTION]
> 目前，无法通过知乎自带的无障碍功能方便的选中此脚本的按钮，请使用快捷键打开/关闭面板。


- 可通过键盘完全操作所有功能
- 历史记录条目增加了为屏幕阅读器设计的 `srOnly` 元素，提供完整信息
- 可交互元素都设置了适当的 aria 属性

### 键盘操作

- <kbd>Tab</kbd> - 在历史记录面板中切换焦点
  - <kbd>Shift</kbd> + <kbd>Tab</kbd> - 反向切换焦点
  - 打开面板后，默认聚焦于第一条历史记录
- 退出面板方式：
  - <kbd>H</kbd> - 再次按下以关闭
  - <kbd>ESC</kbd> - 直接退出
- <kbd>Enter</kbd> - 打开当前选中的回答

## 感谢

- [知乎增强](https://greasyfork.org/scripts/419081) - 参考了部分标题样式
- [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) - 提供最佳开发体验
