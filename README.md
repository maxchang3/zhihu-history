> [!IMPORTANT]
> 目前知乎官方已上线「最近浏览」功能，并支持**移动端历史记录的单向同步**。这意味着本脚本的使用场景或将逐渐消失。
>
> 如果您对本脚本提供的特有功能没有需求，可以无需安装此脚本。
>
> <img width="20%" src="https://github.com/user-attachments/assets/0051f43e-f405-4607-8964-b98d10005b07" />
>
> 接下来的可能方向：
>
> 1. 随着「最近浏览」功能日趋完善，脚本本身的存在意义可能不再。
> 2. 目前情况下，「最近浏览」需要在单独页面查看，若仍未支持全局弹窗，可继续通过调用其 API，自定义渲染位置，实现全局呼出功能。
> 3. 目前情况下，「最近浏览」不支持自定义上限（默认为 200 条），若仍存在历史记录条数限制，脚本可转向为“突破上限”的增强工具。

<p align="center">
  <img src="https://github.com/user-attachments/assets/817d91da-4f26-40e0-8a1f-7905bfb8a199" width="50%" />
  <img src="https://github.com/user-attachments/assets/a6f2558d-87e0-4379-9a1f-ef0da5cb0b76" width="15%" />
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
- 相对完善的无障碍支持
- *所有数据存储在本地*

## 快捷键

- <kbd>H</kbd> - 打开/关闭历史记录面板


## 无障碍

### 目前特性

> [!CAUTION]
> 目前，无法通过知乎自带的无障碍功能方便的选中此脚本的按钮，请使用快捷键打开/关闭面板。

- 记录知乎内置快捷键（<kbd>o</kbd>）打开的内容
- 可通过键盘完全操作所有功能
- 历史记录条目增加了为屏幕阅读器设计的 `srOnly` 元素，提供完整信息
- 可交互元素都设置了适当的 `aria` 属性

### 键盘操作提示

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
