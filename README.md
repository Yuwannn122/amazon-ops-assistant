# 亚马逊运营助手

中文 Listing 工作台：竞品资料、Listing 草稿、关键词建议和广告复盘。

## 在线使用

[打开亚马逊运营助手](https://yuwannn122.github.io/amazon-ops-assistant/)

朋友直接点击上面的正式网站，无需下载代码或启动本地服务。首次填写称呼，可跳过或配置自己的 DeepSeek API Key。

每位访客的 Key 只保留在当前浏览器的 sessionStorage，不写入服务器或仓库。GitHub Pages 版本点击分析时，浏览器直接调用 DeepSeek 官方接口，不经过旧网站。称呼只是本地显示名称，当前版本没有账号注册或跨设备同步。

## 本地开发（仅开发者使用）

下载源码并安装 Node.js 后，运行 `npm run dev`，然后在自己的电脑打开 http://localhost:4174 。

`localhost` 表示当前这台电脑，只有启动了本地服务才可访问；它不是正式网站，也不能作为朋友的使用链接。

## 数据与边界
当前不自动读取 Amazon 页面：导入商品和竞品 JSON 后再分析。ASIN 与资料不匹配会提示导入，不会把演示商品当成真实商品。未提供搜索量、利润与广告数据时，不能给出已验证的投放预算。

页面初始商品、评分、竞品和广告金额均为演示模板，不是实时市场数据。SIF 直连、广告报告 CSV 字段映射和历史持久化仍待后续开发。

## 验证与构建
`npm test` 验证 Key 隔离、输入和跨站校验、模型成功及失败路径。
`npm run build` 生成可部署的 Cloudflare Worker；公共资源内嵌，无需第三方 npm 依赖。

## 回滚
重新部署上一个已保存版本。Key 不保存在服务端，无需迁移访客凭证。


## GitHub Pages 发布

在 GitHub 仓库 Settings → Pages 中选择 main 分支、/docs 目录并保存。

更新界面源码后运行 `node scripts/build-pages.mjs`，将生成的 `docs/index.html` 提交到 GitHub，即可更新 Pages 网站。
运行 `node --test scripts/pages.test.mjs` 验证静态版本与直接 DeepSeek 调用。

首次从旧网址切换时，需要重新填写本浏览器的称呼与个人 DeepSeek Key。代码仓库和 GitHub Pages 文件都不包含真实 Key。

本地运行与原来的 Worker 构建方式继续保留；公开的 GitHub Pages 网站不需要运行这些后端文件。
