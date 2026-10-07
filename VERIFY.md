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

## 2026-10-07 · 自动研究和浏览器数据助手 v0.3
**问题**：旧版依赖手动输入，未满足 ASIN 自动找竞品。
**改变**：网页与 Chrome/Edge 扩展通信；目标读取→检索词推导→热销排序检索→规格/品牌/父子体/广告排除→竞品详情→真实证据约束的 DeepSeek 文案；不再默认展示演示商品。
**验证**：npm test 26 项全部通过；真实接口取得 B0G77TSHLN、48 候选和五个同规格品牌详情；DOM 用真实页面结构测试。未安装到 Chrome/Edge，实网扩展验收待用户一次安装完成；真实用户 Key 未使用。
**规则**：US 非媒体类 75 字符标题、125 字符 Highlights；五点按用户文档的质量目标组织，不能照搬未经本品核实的竞品功能。
**权限**：仅 Amazon.com 读取权限与当前工作台内容脚本；不申请 cookies 或全浏览历史。遇到登录/验证码不假报成功。
**风险**：页面结构、网络和 Amazon 访问限制会变化；评价和购买提示可能聚合变体。词语共现不能伪装为搜索量。
**回滚**：GitHub 恢复上一版 docs/index.html；浏览器卸载数据助手。保留旧研究记录。
