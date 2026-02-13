<p align="center">
  <img src="https://github.com/user-attachments/assets/9de94238-ec78-49ba-b604-9bd6e083c1f6" width="50%" />
  <img src="https://github.com/user-attachments/assets/a6f2558d-87e0-4379-9a1f-ef0da5cb0b76" width="15%" />
</p>

# 知乎历史记录 - 全局面板

> 此为原[知乎历史记录](https://github.com/maxchang3/zhihu-history/tree/legacy)的重构版本，该版本不支持本地存储，数据完全来自知乎 API。

![Greasy Fork 总下载量](https://img.shields.io/greasyfork/dt/459852?style=flat-square&color=444)
![GitHub Release](https://img.shields.io/github/v/release/maxchang3/zhihu-history?style=flat-square&color=444)
![](https://img.shields.io/badge/安装方式:-777)
[![从 Greasy Fork 安装](https://img.shields.io/badge/Greasy_Fork-7D160D)](https://greasyfork.org/scripts/459852) [![从 Github Release 安装](https://img.shields.io/badge/Github_Release-3D7D3F)](https://github.com/maxchang3/zhihu-history/releases/latest/download/zhihu-history.user.js)


> 刷知乎网页版时，最痛苦的事情可能就是：当你正在看一个回答时，因为各种意外刷新了，接着，你就再也找不到它了。🤮
> 
> 某一天，当我又一次深恶痛绝时，最终写下了这个脚本。后来又使用 [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) + React 进行了重构。

现在知乎已经提供了网页版最近浏览功能，但只能在专门的页面查看，且没有搜索功能。于是我决定再次重构。

## 特点

- 贴近知乎设计风格，支持深色模式<sup>*</sup>，使用知乎 API 作为数据源
- 简单的本地搜索（使用 `Intl.Segmenter` 分词）
- 全局快捷键打开历史记录面板，无障碍友好
- 无需额外依赖，复用知乎的 React<sup>**</sup>


<sup>* 尽管如此，脚本的大小仍然不小（50KB 左右）</sup>

<sup>** 这尽管知乎 PC 网页端并没有提供深色模式，但是你可以通过 `?theme=dark` 来启用它。如果你想让这个过程自动化一些，可以使用 [maxchang3/userscripts/zhihu-dark-mode](https://github.com/maxchang3/userscripts/blob/main/zhihu-dark-mode/zhihu-dark-mode.user.js)。不过由于知乎限制，自动切换时一些组件样式不会变化，必须要刷新页面才能完全切换。</sup>

## 快捷键

- <kbd>H</kbd> - 打开/关闭历史记录面板
- <kbd>/</kbd> - 在面板内打开/关闭搜索框

## 无障碍操作

- <kbd>Tab</kbd> - 在历史记录面板中切换焦点
  - <kbd>Shift</kbd> + <kbd>Tab</kbd> - 反向切换焦点
  - 打开面板后，默认聚焦于第一条历史记录
- 退出面板方式：
  - <kbd>H</kbd> - 再次按下以关闭
  - <kbd>ESC</kbd> - 直接退出
- <kbd>Enter</kbd> - 打开当前选中的回答

## 感谢

- [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) - 提供最佳开发体验
