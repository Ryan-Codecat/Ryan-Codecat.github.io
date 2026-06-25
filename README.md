# Ryan You Personal Homepage

个人主页静态站点，面向 GitHub Pages 部署。

## 本地预览

直接打开 `index.html` 即可预览，或使用任意静态服务器。

## GitHub Pages

推荐仓库名：

```text
<your-github-username>.github.io
```

把本目录内容推送到该仓库的 `main` 分支后，在 GitHub 仓库设置中启用 Pages，来源选择 `Deploy from a branch`，分支选择 `main` / root。

也可以使用本仓库的部署脚本。先在当前 PowerShell 会话里设置 token 环境变量，再运行：

```powershell
$env:GITHUB_TOKEN = "<your-token>"
.\deploy-github-pages.ps1
```

## Security Note

不要把 GitHub access token 写入仓库、命令历史或网页文件。若 token 曾经发到聊天、截图或公开位置，请在 GitHub 中撤销并重新生成。
