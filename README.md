# Organic Structure Miniapp

高中化学“有机化合物结构测定”交互练习网页原型。

## 功能

- 方法：结构测定路线图与不饱和度计算。
- 基础·学习理解：在同一页面切换试剂反应判断和有机物间反应判断。
- 进阶·应用实践：只给分子式，通过规则型 AI 或 DeepSeek 推理助手问答来推断结构。
- 高阶·迁移创新：保留分子式推理工作台，并接入“工具性质问答”和“个人反思总结”两个外部学习接口。

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
4. 打开 GitHub Pages 页面，在应用实践或迁移创新页面的“DeepSeek 代理 URL”输入框填入代理地址。

如果网页和 API 都部署在同一个 Vercel 项目，代理 URL 可填 `/api/deepseek`。

## 外部学习接口

迁移创新页面右侧支持两个外部 URL。可以直接在页面输入，失焦后自动保存到当前浏览器并启用“打开”按钮；也可以在构建环境中预设：

```bash
VITE_TOOL_QA_URL=https://example.com/property-qa
VITE_REFLECTION_URL=https://example.com/reflection
```

接口只接受站内相对路径或 `http/https` 地址。这两个 URL 会进入前端静态资源，不要在其中放置密钥或其他敏感参数。
