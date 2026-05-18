# 设计资产交接与命名规范

## 目录规范

新项目推荐使用：

```text
custom-assets/
  project-name/
    avatars/
    icons/
    cards/
    dialogs/
    inputs/
    screenshots/
    raw-figma/
```

## 命名规范

使用小写英文、短横线和模块前缀：

```text
home-input.svg
agent-card-selected.svg
skill-popover-manage.svg
avatar-study-planner.png
toast-add-success.svg
task-card-empty.png
```

不要使用：

- `未命名.svg`
- `截图 2026-xx-xx.png`
- `Frame 123.svg`
- `新建副本 2.png`

如果设计工具导出的文件名不可控，放入项目后应重命名。

## 资产选择原则

- **需要点击或动态变化的区域**：优先用 HTML/CSS 重建。
- **视觉复杂但不需要交互的区域**：可以先用 SVG/PNG 承载。
- **高频复用组件**：拆成 DOM + 数据渲染，方便统一修改。
- **临时过渡方案**：允许用图片占位，但必须标注后续是否需要拆分。

## Figma 交接要求

设计方需要提供：

- Figma 文件链接。
- 关键页面 node 链接。
- 导出的 SVG/PNG。
- 字号、颜色、间距如与设计稿不一致，需要单独说明。
- 组件状态：默认、hover、选中、禁用、展开、空态。

## 缓存规则

静态 Demo 常见问题是浏览器继续读取旧资源。每次替换关键资源时：

- CSS/JS 引用加版本号，例如 `styles.css?v=12`。
- 图片/SVG 背景可加版本号，例如 `card.svg?v=2`。
- 同名资源替换后必须本地刷新验证。

## 资产验收清单

- 文件能被页面正确加载。
- 透明背景、尺寸、裁切符合预期。
- 头像和 icon 在深色背景下可见。
- SVG 没有意外内嵌旧文字。
- 关键资产在 GitHub Pages 上也能显示。
