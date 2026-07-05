# Organic Structure Miniapp

高中化学“有机化合物结构测定”交互练习网页原型。

## 功能

- 基础：随机有机物与常见试剂反应判断。
- 进阶：两种有机物之间的反应可行性判断。
- 高阶：只给分子式，通过规则型 AI 推理助手问答来推断结构。

## 本地运行

```bash
npm install
npm run dev
```

## 验证

```bash
npm test -- --run
npm run build
```

## GitHub Pages

仓库推到 GitHub 后，启用 Pages 的 GitHub Actions 来源即可。`.github/workflows/pages.yml` 会在 `main` 分支构建并发布 `dist`。

## AI 边界

当前版本是规则型智能体原型，不调用 GPT 或 DeepSeek API。它适合 2026-07-06 前的教学需求宣讲和 MVP 试用；后续可增加 Serverless API，把高阶问答替换为真实大模型。
