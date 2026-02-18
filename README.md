<p align="center">
  <img src="https://github.com/user-attachments/assets/f611be20-fafe-4528-8d83-c925de46c5b5" width="50%" />
  <img src="https://github.com/user-attachments/assets/a6f2558d-87e0-4379-9a1f-ef0da5cb0b76" width="15%" />
</p>

# 知乎历史记录 - 全局面板

> 此为原[知乎历史记录](https://github.com/maxchang3/zhihu-history/tree/legacy)的重构版本，该版本不支持本地存储，数据完全来自知乎 API。

![Greasy Fork 总下载量](https://img.shields.io/greasyfork/dt/566203?style=flat-square&color=444)
![GitHub Release](https://img.shields.io/github/v/release/maxchang3/zhihu-history?style=flat-square&color=444)
 [![安装方式](https://img.shields.io/badge/安装方式-777?style=flat-square)](https://greasyfork.org/)
[![Greasy Fork](https://img.shields.io/badge/Greasy_Fork-7D160D?style=flat-square)](https://greasyfork.org/scripts/566203)
[![GitHub Release](https://img.shields.io/badge/GitHub_Release-3D7D3F?style=flat-square)](https://github.com/maxchang3/zhihu-history/releases/latest/download/zhihu-history-gp.user.js)


目前知乎网页版已经支持查看最近浏览，但只能在独立的页面查看，且没有搜索功能。此脚本提供一个全局可访问的面板，方便浏览、搜索和管理你的知乎最近浏览记录。

## 特点

- 贴近知乎设计风格，支持深色模式<sup>*</sup>，使用知乎 API 作为数据源
- 简单的本地搜索（使用 `Intl.Segmenter` 分词）
- 支持完全使用快捷键操作交互，无障碍友好
- 无需额外依赖，复用知乎的 React<sup>**</sup>


<sup>* 尽管如此，脚本的大小仍然不小（50KB 左右）</sup>

<sup>** 尽管知乎的PC网页端没有提供深色模式，但你可以通过添加 `?theme=dark` 来启用它。如果想自动化这一过程，可以使用 [maxchang3/userscripts/zhihu-dark-mode](https://github.com/maxchang3/userscripts/blob/main/zhihu-dark-mode)。不过，由于知乎的限制，自动切换时部分组件样式不会立即更新，需要刷新页面才能完全切换。</sup>

## 快捷键

- <kbd>H</kbd> - 打开/关闭面板
- <kbd>/</kbd> - 在面板内打开/关闭搜索框
- <kbd>Tab</kbd> - 在面板中切换焦点
  - <kbd>Shift</kbd> + <kbd>Tab</kbd> - 反向切换焦点
  - 打开面板后，默认聚焦于最近浏览区域
- <kbd>Enter</kbd> - 打开当前选中的回答

## 感谢

- [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) - 提供最佳开发体验
