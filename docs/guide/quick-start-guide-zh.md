# Runtime TelegramBot Desktop Titan Edition — 快速入门指南

欢迎使用 **Runtime TelegramBot Desktop Titan Edition**。本指南将帮助您配置第一个机器人，并在几分钟内开始向您的 Telegram 频道发布内容。

---

## 1. 获取 Telegram 令牌

在启动应用程序之前，您需要在 Telegram 上创建一个机器人：

1. 打开 Telegram，搜索 **@BotFather**（带有蓝色验证标记）。
2. 发送命令 `/newbot`，按照说明为机器人指定名称。
3. @BotFather 将返回一个 **API 令牌**（例如 `123456789:ABCdefGHIjklMNOpqr...`）。复制它。
4. 将机器人作为**管理员**添加到您的 Telegram 频道，并授予发送消息的权限。

---

## 2. 首次启动 — 机器人配置

首次启动时，点击 **"+ 新建机器人"** 并填写以下字段：

- **名称** — 用于在界面中识别机器人的名称（例如 *新闻频道*）。
- **令牌** — @BotFather 提供的 API 令牌。
- **Channel ID** — 频道名称（例如 `@我的频道`）或私有频道的数字 ID（例如 `-100123456789`）。
- **开始日期** — 机器人将忽略此日期之前发布的所有内容。有助于避免用旧文章刷屏频道。

---

## 3. 添加 Feed（Feed Manager）

在机器人控制面板中，点击 **"+ 添加 Feed"**：

1. 为 feed 指定一个描述性**名称**。
2. 选择**类型**：News、Podcast 或 YouTube。
3. 粘贴 **URL**：
   - News / Podcast：RSS feed 的 URL。
   - YouTube：频道 URL 或 handle（例如 `@RuntimeRadio`）。*无需 API Key。*
4. 使用 **测试 (⚡)** 验证链接的有效性，然后点击**保存**。

### Feed 高级选项

- **关键词过滤器** — 按关键词过滤文章（包含或排除）。可在 feed 设置中启用。琥珀色徽章表示过滤器已激活。
- **自定义间隔** — 为该 feed 设置独立的获取间隔（5 分钟至 24 小时），不受机器人全局间隔影响。
- **Digest Mode** — 不再逐篇发布文章，而是在可配置的时间段内（1小时、6小时、12小时、24小时、7天）积累内容，并以一条摘要消息发送。紫色徽章表示该模式已激活。
- **OPML 导入** — 通过 Feed Manager 中的 OPML 按钮，从标准 `.opml` 文件一次性导入多个 feed。

---

## 4. 自定义消息（Template）

进入机器人设置 → **Template** 选项卡：

- 使用 **Smart Chips** 插入动态变量：`{{title}}`、`{{link}}`、`{{summary}}`、`{{feedName}}` 等。
- 提供 4 个独立模板：启动、News、Podcast、YouTube。
- **验证器**实时提示错误（标签不平衡、未知 chip、不安全链接）。
- **预览** 按钮可显示消息使用示例数据后的效果，无需离开编辑器。

Telegram 支持的 HTML 标签：`<b>`、`<i>`、`<code>`、`<a href="...">`。

---

## 5. 启动 — Ignition

机器人配置完成且已添加 feed 后：

- 点击控制台中的 **播放 (▶)** 按钮。
- 状态环将开始旋转，机器人开始运行。
- 在 **System Logs** 面板中，您将实时看到 feed 获取和 Telegram 发布的情况。

要同时监控多个机器人，请使用日志中的 **ALL BOTS / THIS BOT** 切换按钮。

---

## 6. 统计数据

点击控制面板中的 **Analytics（📊）** 图标查看：

- 已发布文章计数器：今天 / 过去 7 天 / 总计。
- 按 feed 分类的详细数据，按发布量排序。

---

## 系统设置

通过右上角的齿轮图标访问：

- **常规** — 全局检查间隔、静默时间、语言。
- **备份** — 数据库导出和恢复。
- **Performance Mode** — 禁用 GPU 密集型效果（扫描线、模糊、发光、动画）。适用于硬件配置有限的设备。立即生效，无需重启。

---

## 可移植性 — .rtb 文件

要将机器人迁移到另一台电脑而不丢失配置：

1. 在机器人设置中 → **导出 (.rtb)**。
2. 将文件传输到新电脑。
3. 在新电脑上 → **导入 (.rtb)**，然后重新输入令牌（出于安全考虑，令牌与特定机器绑定）。

---

## 故障排除

- **YouTube 错误** — Google 会定期更新其服务器。如果 YouTube feed 出现红色错误，请暂时禁用该 feed，等待应用程序更新。
- **令牌无效** — 确认机器人已作为管理员添加到频道，且具有发送消息的权限。
- **Linux 缺少 libsecret** — 应用程序使用 AES-256-GCM 回退方案正常运行。如需原生密钥链，请安装：`sudo apt-get install libsecret-1-0`。

---

**Runtime TelegramBot Desktop · Titan Edition** 是自由软件，依据 **MIT 许可证** 发布：您可以使用、研究、修改并再分发它。

大部分代码借助语言模型编写（Google Gemini、Anthropic Claude）。构思、项目主导与核验均出自 Simone Pizzi。

完整内容请参阅 PDF 格式的 **高级用户手册**，共有八种语言版本。

联系方式：simonepizzi.runtimeradio.it/contatti
自愿捐赠：paypal.me/runtimeradio
