# Git 与静态部署（Vercel / Netlify）

本仓库根目录为 `教学实训一体化平台`，前端工程在子目录：

`产品名称：教学科研实训一体化平台/制作交互页面`

云端构建时**必须把「项目根目录 / Base directory」指向该子目录**，否则找不到 `package.json`，且 `@mock` 别名依赖同级的 `mock-data`。

---

## 1. 创建 GitHub 仓库并推送（首次）

在 GitHub 新建空仓库（不要勾选初始化 README），然后在本机执行（将 URL 换成你的仓库）：

```bash
cd "/Users/hororo/Desktop/教学实训一体化平台"
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git branch -M main
git push -u origin main
```

若使用 SSH：

```bash
git remote add origin git@github.com:<你的用户名>/<仓库名>.git
```

---

## 2. Vercel

1. 登录 [vercel.com](https://vercel.com)，Import 上述 GitHub 仓库。
2. **Root Directory**：填  
   `产品名称：教学科研实训一体化平台/制作交互页面`
3. Framework Preset 选 **Vite**（或留空自动识别）。
4. Build Command：`npm run build`（默认即可）  
   Output Directory：`dist`（默认即可）
5. Deploy。完成后得到 `*.vercel.app` 域名。

`vercel.json` 已配置 SPA 回退到 `index.html`。

---

## 3. Netlify

1. 登录 [netlify.com](https://netlify.com)，从 Git 导入仓库。
2. **Base directory**：  
   `产品名称：教学科研实训一体化平台/制作交互页面`
3. 构建命令与发布目录会读取该目录下的 `netlify.toml`（`npm ci && npm run build`，发布 `dist`）。

---

## 4. 可选：仅部署前端子目录为单独仓库

若不想把整个「产品文档 + mock-data」推到 GitHub，可另建仓库只拷贝 `制作交互页面`，并把 `vite.config.ts` 里的 `@mock` 改为相对路径指向子模块或内联数据；当前 monorepo 方式更适合你现有 `@mock` 结构。
