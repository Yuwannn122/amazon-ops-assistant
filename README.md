# 亚马逊运营助手

网页：https://yuwannn122.github.io/amazon-ops-assistant/

## v0.3 自动研究方式
在 Chrome 或 Edge 一次安装网页提供的数据助手，然后在同一个浏览器打开工作台。输入美国站 ASIN 后，自动读取目标商品、发现并筛选同类竞品、提取关键词共现证据，并用个人 DeepSeek Key 优化标题、Item Highlights、五点和描述。不需要手动复制 Listing 或编写 JSON。

插件安装说明：[browser-extension/README.md](browser-extension/README.md)。安装包在网页内“安装数据助手”处下载。

已有 SIF 付费会员可以点击“导入 SIF 关键词表”，复用导出的 XLSX、CSV 或 TSV。核对要优化的 ASIN、数据来源 ASIN、周期与列名后，模型会结合月搜索量、流量占比和排名等已提供字段；没有自动读取 SIF 插件或登录凭证。采集助手只补充公开商品和竞品详情，SIF 继续负责关键词与流量研究。旧 XLS 请先另存为 XLSX 或 CSV。

没有数据助手时，页面会明确显示未连接，不显示演示商品。遇到 Amazon 访问验证或字段缺失时会报告失败。正常使用会打开临时后台标签页并在读取完成后关闭。

## Listing 依据
按照用户提供的产品定位、核心词和“功能→优势→客户收益”框架，并以最新 Amazon 规则约束输出。美国站非媒体类新标题目标 75 字符内，Item Highlights 125 字符内；站点/类目差异仍需核对后台指南。

- https://sellercentral.amazon.com/seller-forums/discussions/t/145b6d0f-999c-4555-896c-c694bda2e470
- https://sellercentral.amazon.com/seller-forums/discussions/t/65f8e647-977d-49ac-9036-2049b96720b2

竞品的功能不能复制成本品功能。对照依据包含 ASIN、来源字段、抓取时间以及异常数据标记。购买提示、BSR、评价数和搜索位置含义不同；没有证据不会宣称销量最高。竞品文案词不等于真实搜索量/广告流量；SIF 等数据需要另行授权接入。

## 密钥和记录
DeepSeek Key 只存本浏览器会话，直接发给 DeepSeek，不发给插件、GitHub 或本机研究记录。完成的资料和文案可在产品库/优化记录打开，最多保留本机 20 条记录，也可导出 JSON；没有云同步或账号注册。

## 构建与验证
安装 Node.js 后运行 npm ci，再运行 npm test。

- npm run build:extension：生成扩展共享核心。
- npm run build:pages：生成 docs/index.html。
- 扩展 ZIP 由 browser-extension 目录生成，不包含 .env、Git 历史、node_modules 或研究原始快照。

DOM 测试使用固定版 linkedom；扩展与网页运行时不依赖它。所有抓取和模型流程均有失败路径，缺失数据不替换为演示结果。

## 当前状态与回滚
32 项模块/DOM/交互测试通过，包含 SIF 的 CSV/XLSX 解析、字段映射、ASIN/周期校验与模型传递。尚未取得小羊的真实导出样本；导入预览允许手动核对列名。公开数据接口已取到真实目标、48 个候选和五个同规格不同品牌详情。Chrome/Edge 中的真实扩展抓取，需要用户安装后在实际网络验收；尚未使用用户真实 DeepSeek Key 生成。

回滚可恢复 GitHub Pages 上一版 docs/index.html，并卸载数据助手。源码仍保留原来的 Worker 构建及受保护的可选数据后端，但浏览器模式不依赖它们。
