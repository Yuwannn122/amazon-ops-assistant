## 2026-10-05 · 公开部署准备
- 名称：亚马逊运营助手（amazon-ops-assistant）。
- 每个访客使用自己的 DeepSeek Key；不会写入服务器 `.env`。
- 仅公开 index.html、前端 JS/CSS 和 favicon，后端和密钥文件不可读取。
- 模型结果显示于总览、Listing、关键词、广告四个视图。
- 真实 DeepSeek Key 未提供，API 通道使用 mock 验证；真实调用待用户设置后执行。
- GitHub 上传需要用户连接账号；网站托管可独立完成。

## 2026-10-07 · GitHub Pages 迁移
背景：旧域名在朋友网络需要 VPN，提供独立 GitHub Pages 部署。
范围：docs/index.html 独立静态发布、浏览器直接 DeepSeek；保留当前工作台交互。
验收：node scripts/build-pages.mjs；node --test scripts/pages.test.mjs；实际 Pages 网页加载、导航、设置和资料导入。
风险：GitHub Pages 的国内可达性仍受网络影响；真实模型调用需要访客自己的 Key。
回滚：GitHub 撤销本次 docs 更新或在 Pages 设置改回原发布源；旧网站未删除。
已完成：3 项新测试通过；DeepSeek 官方 CORS 预检返回 HTTP 200，允许 github.io Origin/Authorization/Content-Type/POST。

## 2026-10-07 · 纠正模型配置与商品资料混淆
问题：保存 DeepSeek Key 后仍显示默认商品，输入 B0G77TSHLN 又因缺少资料被拦截。
改动：分别显示模型配置/验证状态和商品资料来源；Key 设置增加模型列表测试；新 ASIN 可打开 Amazon 并粘贴标题与 Listing，无需 JSON；非演示资料未分析前显示等待状态。
自动读取 Amazon 仍未接通。匿名 Reader 实测无法稳定连接；不能把没有拿到的商品资料当成抓取成功。SIF MCP 需要用户自己的 SIF 权限，不等于 DeepSeek Key。
验证：node scripts/build-pages.mjs；node --test scripts/pages.test.mjs scripts/guidance.test.mjs，共 6 项通过（含真实 ASIN 格式、密钥测试成功/失败、无密钥泄露、旧域名依赖检查）。
回滚：GitHub 恢复上一版 docs/index.html。
