# Git 与静态部署（河南科技大学专用说明）

> **本副本绑定说明**  
> - **GitHub 工作分支**：`河南科技大学`（日常提交、推送仅限该分支；**勿默认操作 `main`**）。  
> - **Netlify 生产站点**：https://haustsmartteaching.netlify.app/  
> - **合并主版本**：仅在提出明确要求时，再执行向 `main` 的合并或推送，避免与主版本产生非预期交集。  
> - 本地 `.git/config` 中 `remote.origin.fetch` 已限制为只拉取 `origin/河南科技大学`；若需临时查看 `main`，请单独执行：  
>   `git fetch origin main:refs/remotes/origin/main`

本仓库根目录为 **教学实训一体化平台-河南科技大学**（本机路径以实际为准），前端工程在子目录：

`产品名称：教学科研实训一体化平台/制作交互页面`

云端构建时**必须把「项目根目录 / Base directory」指向该子目录**（或使用仓库根目录 `netlify.toml` 中已配置的 `base`），否则找不到 `package.json`，且 `@mock` 别名依赖同级的 `mock-data`。

---

## 1. GitHub 与分支

仓库示例：`https://github.com/HororoA/smart-teaching.git`

日常流程（**河南科技大学**）：

```bash
cd "/Users/hororo/Desktop/教学实训一体化平台-河南科技大学"   # 按本机路径调整
git checkout 河南科技大学
git pull   # 仅更新 origin/河南科技大学
git add -A && git commit -m "你的说明"
git push -u origin 河南科技大学
```

**不要**默认执行 `git push origin main` 或与 `main` 的合并，除非已明确需要发布到主版本。

---

## 2. Vercel

1. 登录 [vercel.com](https://vercel.com)，Import 上述 GitHub 仓库。
2. **Root Directory**：填  
   `产品名称：教学科研实训一体化平台/制作交互页面`
3. **Git Branch**：选择 **`河南科技大学`**（若使用本副本专用部署）。
4. Framework Preset 选 **Vite**（或留空自动识别）。
5. Build Command：`npm run build`（默认即可）  
   Output Directory：`dist`（默认即可）
6. Deploy。

`vercel.json`（若存在）已配置 SPA 回退到 `index.html`。

---

## 3. Netlify（河南科技大学 → haustsmartteaching）

1. 登录 [netlify.com](https://netlify.com)，从 Git 导入仓库。
2. **生产站点**：https://haustsmartteaching.netlify.app/
3. **Branch to deploy**：**`河南科技大学`**
4. **Base directory**：  
   `产品名称：教学科研实训一体化平台/制作交互页面`  
   （若使用仓库根目录的 `netlify.toml`，其中已设置 `base`，与后台填写需一致。）
5. 构建命令与发布目录：`npm ci && npm run build`，发布 `dist`。

仓库内 GitHub Actions「Deploy to Netlify」亦仅在推送 **`河南科技大学`** 时触发，避免与主版本分支混淆。

---

## 4. 可选：仅部署前端子目录为单独仓库

若不想把整个「产品文档 + mock-data」推到 GitHub，可另建仓库只拷贝 `制作交互页面`，并把 `vite.config.ts` 里的 `@mock` 改为相对路径指向子模块或内联数据；当前 monorepo 方式更适合你现有 `@mock` 结构。
