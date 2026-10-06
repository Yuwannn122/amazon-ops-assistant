## 2026-10-05 · 公开部署准备
- 名称：亚马逊运营助手（amazon-ops-assistant）。
- 每个访客使用自己的 DeepSeek Key；不会写入服务器 `.env`。
- 仅公开 index.html、前端 JS/CSS 和 favicon，后端和密钥文件不可读取。
- 模型结果显示于总览、Listing、关键词、广告四个视图。
- 真实 DeepSeek Key 未提供，API 通道使用 mock 验证；真实调用待用户设置后执行。
- GitHub 上传需要用户连接账号；网站托管可独立完成。
