# 联想天禧可交互 Demo 快速实现工作流包

这是一套面向联想天禧设计团队的可复用 Demo 生产方法。目标不是一次性做出生产级前端，而是在最短时间内把核心场景跑通，再逐步还原关键页面、关键流程和关键状态的视觉细节。

## 适用场景

- 需要快速演示一个产品概念、AI 工作流、智能体能力或多页面体验。
- 需要把 Figma 设计稿、截图、文案和资产快速转成可点击 Demo。
- 需要在浏览器里反复批注、快速修改、快速部署给团队评审。
- 需要保留一套可复制的方法，而不是每个项目从零开始。

## 工作流总览

| 阶段 | 目标 | 产出 | 设计团队重点 |
| --- | --- | --- | --- |
| P0 快速跑通 | 先让完整流程可点击 | 可打开、可走通、可演示的骨架 Demo | 确认流程和内容方向，不纠结像素 |
| P1 关键路径还原 | 把高频演示路径做像 | 关键页面、弹窗、输入框、卡片、列表 | 标注关键组件和状态 |
| P2 视觉细节补齐 | 把穿帮处补齐 | hover、选中态、toast、滚动条、头像、icon | 做集中批注和验收 |
| P3 演示稳定化 | 让 Demo 可靠交付 | GitHub Pages 链接、变更记录、验收清单 | 统一从线上链接验收 |

## 包内文件

- [workflow.md](./workflow.md)：完整方法和执行节奏。
- [collaboration-guide.md](./collaboration-guide.md)：设计方、需求方、实现者如何配合。
- [asset-guidelines.md](./asset-guidelines.md)：Figma、图片、SVG、头像、icon 的交接和命名规范。
- [iteration-rules.md](./iteration-rules.md)：浏览器批注、迭代节奏和每轮反馈规则。
- [delivery-checklist.md](./delivery-checklist.md)：每轮交付前检查项。
- [templates/demo-brief.md](./templates/demo-brief.md)：启动前需求 Brief 模板。
- [templates/figma-asset-handoff.md](./templates/figma-asset-handoff.md)：设计资产交接清单。
- [templates/review-comment.md](./templates/review-comment.md)：浏览器批注格式模板。
- [templates/iteration-log.md](./templates/iteration-log.md)：每轮变更记录模板。
- [template-static-demo/](./template-static-demo/)：可复制的静态 Demo 起步模板。

## 推荐用法

1. 复制 `template-static-demo/` 作为新项目起点。
2. 用 `templates/demo-brief.md` 填好目标、流程、页面和资产。
3. 先按 P0 做出可点击骨架。
4. 设计方用浏览器批注集中反馈。
5. 实现者按 P1/P2 分轮处理。
6. 每轮用 `delivery-checklist.md` 检查并推送线上预览。

## 核心原则

- 先通后精：流程没跑通前，不做像素级纠偏。
- 关键优先：只对高频演示路径做高还原。
- 批量处理：同类问题集中改，不一条一条散修。
- 资产入库：所有项目资产可追溯、可替换、可复用。
- 每轮可验收：每次改动都有可打开的链接和明确变更范围。
