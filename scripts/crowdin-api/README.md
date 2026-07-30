# Crowdin 多人协作工具

本目录负责在 Git 任务分支、任务级中文源文件、Crowdin 翻译文件和应用最终语言包之间同步数据。

## 数据流

```text
src/i18n/source/*.json
  |-> merge -> src/i18n/locales/zh-CN.json
  |-> push  -> Crowdin main 分支 -> 专业翻译
                                     |
                                pull v
                    src/i18n/downloads/{locale}/*.json
                                     |
                               merge v
                    src/i18n/locales/{locale}.json
```

Crowdin 固定使用 `main` 分支。开发者的 Git 功能分支只用于决定默认任务文件名，不会在 Crowdin 创建同名分支。

Crowdin 项目本身必须配置：

- Source language: Chinese Simplified `zh-CN`
- Target languages: English `en`、Portuguese, Brazilian `pt-BR`、Spanish, Mexican `es-MX`

push/pull 会在远端操作前校验这些语言，配置不一致时直接停止，避免将中文 source 以错误语言上传。项目 `917095` 在 2026-07-30 的只读检查中仍配置为 English source，首次使用前需要在 Crowdin 项目设置中改为 Chinese Simplified，并从目标语言中移除 Chinese Simplified。

## 目录职责

```text
src/i18n/source/          中文源文案分片，由开发者维护
src/i18n/downloads/       Crowdin 目标语言分片，由 pull 更新
src/i18n/locales/         应用加载的完整语言包，由 merge 生成
```

三个目录都需要提交 Git。`downloads` 是单文件 pull 后仍能重建完整语言包的基础，不是临时目录。

语言映射：

| Crowdin 语言                  | 分片目录          | 应用语言文件         |
| ----------------------------- | ----------------- | -------------------- |
| English `en`                  | `downloads/en-US` | `locales/en-US.json` |
| Portuguese, Brazilian `pt-BR` | `downloads/pt`    | `locales/pt.json`    |
| Spanish, Mexican `es-MX`      | `downloads/es`    | `locales/es.json`    |
| Chinese Simplified            | `source`          | `locales/zh-CN.json` |

## 日常开发流程

### 1. 创建任务分支和 source 文件

切换到约定的任务分支后执行：

```bash
pnpm crowdin:create
```

例如当前分支是 `feat/123456`，脚本会创建：

```text
src/i18n/source/feat__123456.json
```

脚本不解析 Meegle 任务号，只将 `/` 和 `\` 转换为 `__`，并清理不能用于文件名的字符。也可以显式指定名称：

```bash
pnpm crowdin:create -- 123456
```

### 2. 添加中文源文案

只在当前任务的 source 文件中添加本任务负责的文案：

```json
{
  "order": {
    "submit": "提交订单",
    "success": "订单提交成功"
  }
}
```

不同 source 文件不能定义相同的叶子 key。公共文案也必须有明确归属文件，不能复制到多个任务文件。

### 3. 同步本地语言包

```bash
pnpm crowdin:merge
```

merge 会：

- 检查 source JSON、重复 key 和对象/字符串结构冲突。
- 合并中文 source，生成 `locales/zh-CN.json`。
- 合并已有 Crowdin 翻译分片。
- 目标语言缺少翻译时，在最终 locale 中暂时回退中文。
- 删除最终 locale 中已经不存在于 source 的废弃 key。
- 校验 `{{variable}}` 插值变量和 `<tag>` 标签。

因此新 key 在专业翻译完成前就可以用于开发。中文回退只进入最终 `locales`，不会写入 `downloads` 冒充真实翻译。

### 4. 推送到 Crowdin

默认推送当前分支对应的 source 文件：

```bash
pnpm crowdin:push
```

显式指定任务号、文件名或路径：

```bash
pnpm crowdin:push -- 123456
pnpm crowdin:push -- feat__123456.json
pnpm crowdin:push -- src/i18n/source/feat__123456.json
```

推送本地全部 source：

```bash
pnpm crowdin:push:all
# 等价于
pnpm crowdin:push -- --all
```

push 会先执行本地 merge 和全局 source 冲突检查。Crowdin 中不存在的文件会创建，已存在的文件会更新并保留翻译、撤销受影响内容的审批状态。

push 不会删除 Crowdin 中的其他文件。功能分支看不到其他未合并任务，自动删除可能误删其他组员已经上传的任务文件。

### 5. 拉取专业翻译

翻译人员通知完成后，在任务分支执行：

```bash
pnpm crowdin:pull
```

脚本会为当前任务文件分别下载 English、Portuguese (Brazil) 和 Spanish (Mexico)，全部下载并严格校验成功后才写入 `downloads`，随后自动 merge。单文件 pull 只严格校验本次下载的文件；其他任务遗留的不兼容旧翻译会继续使用中文回退，可通过 `crowdin:check` 集中发现。

其他用法：

```bash
pnpm crowdin:pull -- 123456
pnpm crowdin:pull -- feat__123456.json
pnpm crowdin:pull:all
pnpm crowdin:pull -- --all
pnpm crowdin:pull -- --approved-only
pnpm crowdin:pull -- --all --approved-only
```

默认拉取最新翻译。`--approved-only` 只拉取 Crowdin 已批准内容。未翻译或未批准的 key 不写入分片，merge 会在最终 locale 中使用中文回退。

## 本地检查

```bash
pnpm crowdin:check
```

check 不修改文件，并严格检查：

- 所有 source/translation JSON 结构。
- source 重复 key 和前缀结构冲突。
- 翻译插值变量和标签是否与中文一致。
- 配置中的语言映射是否有效。

普通 merge 遇到与新源文案不兼容的旧翻译时会使用中文回退并报告“无效翻译”，避免开发者无法先 push 更新后的源文案。`crowdin:check` 和 pull 对这些问题会严格报错。

## 终端输出

脚本只输出必要状态，组员和 CI 都可以快速定位当前结果：

| 前缀         | 含义                             |
| ------------ | -------------------------------- |
| `[Crowdin]`  | 当前执行的 Crowdin 命令          |
| `[Info]`     | 文件范围或合并统计               |
| `[Progress]` | 多文件上传或下载进度             |
| `[OK]`       | 当前操作已成功落地               |
| `[Warn]`     | 可继续但需要留意的翻译状态       |
| `[Error]`    | 操作已停止，后续文字给出具体原因 |
| `[Next]`     | 团队工作流中的建议后续命令       |

日志不会输出 `api_token`。

## 命令速查

| 命令                    | 用途                             |
| ----------------------- | -------------------------------- |
| `pnpm crowdin:create`   | 根据当前 Git 分支创建任务 source |
| `pnpm crowdin:check`    | 严格检查本地翻译资源，不写文件   |
| `pnpm crowdin:merge`    | 同步 key 并生成四个最终 locale   |
| `pnpm crowdin:push`     | 推送当前任务 source              |
| `pnpm crowdin:push:all` | 推送本地全部 source              |
| `pnpm crowdin:pull`     | 拉取当前任务的三种目标语言       |
| `pnpm crowdin:pull:all` | 拉取本地全部任务的目标语言       |

## 常见错误

### 当前分支对应的 source 文件不存在

先执行 `pnpm crowdin:create`。如果当前分支不是任务分支，请显式指定已有文件。

### source key 冲突

错误信息会列出 key 和涉及的文件。保留唯一归属，删除其他文件中的重复定义后重新 merge。

### 插值变量或标签不一致

例如中文含有 `{{point}}`，翻译也必须保留同名变量；中文使用 `<tag>` 时翻译必须保留对应开始和结束标签。修正 Crowdin 翻译后重新 pull。

### Crowdin 中找不到 source

先执行 push。pull 只读取固定 Crowdin `main` 分支，不会自动创建远端 source。

### detached HEAD

默认文件解析依赖当前 Git 分支。切换到正常任务分支，或者在 push/pull 时显式指定任务文件。
