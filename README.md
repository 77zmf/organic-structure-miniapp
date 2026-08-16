# Organic Structure Miniapp

高中化学“有机化合物结构测定”交互练习网页原型。

## 功能

- 方法：结构测定路线图与不饱和度计算。
- 基础·学习理解：在同一页面切换试剂反应判断和有机物间反应判断。
- 进阶·应用实践：只给分子式，通过规则型 AI 或 DeepSeek 推理助手问答来推断结构。
- 高阶·迁移创新：保留分子式推理工作台，并内置“工具性质问答”和“个人反思总结”学习闭环。

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

默认版本使用规则型智能体原型，适合 2026-07-06 前的教学需求宣讲和 MVP 试用。仓库同时提供 `api/deepseek.ts` 作为 Serverless 代理，部署到 Vercel 后可以接入 DeepSeek。

不要把 DeepSeek API Key 写进前端代码、`.env` 提交到仓库，或放进 GitHub Pages 静态资源。Key 只能放在服务端环境变量里。

## DeepSeek 代理部署

推荐用 Vercel 连接本仓库：

1. 在 Vercel 导入 `77zmf/organic-structure-miniapp`。
2. 设置环境变量：
   - `DEEPSEEK_API_KEY`: DeepSeek API Key
   - `DEEPSEEK_MODEL`: 可选，默认 `deepseek-v4-flash`
   - `ALLOWED_ORIGINS`: 可选，默认允许 `https://77zmf.github.io`、`http://localhost:5173`、`http://127.0.0.1:5173`
3. 部署后得到类似 `https://your-app.vercel.app/api/deepseek` 的代理地址。
4. GitHub Pages 会自动使用 `https://organic-structure-miniapp.vercel.app/api/deepseek`，学生端无需填写代理地址。

如果网页和 API 都部署在同一个 Vercel 项目，应用会自动使用同源 `/api/deepseek`。需要改用其他代理时，可在构建环境设置 `VITE_DEEPSEEK_PROXY_URL`，或使用仅供部署排查的 `?deepseekProxy=https://...` 查询参数。

远程服务异常时，问答会自动切换为本地规则助手，学生仍可继续完成推理。

## 迁移学习工具

- “工具性质问答”直接聚焦当前题目的内置问答，不离开推理现场。
- “个人反思总结”根据学生已经提出的问题、证据板和当前结构猜想生成本轮反思，不读取或泄露隐藏答案。
