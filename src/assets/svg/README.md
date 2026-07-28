# SVG 资源

业务代码统一通过 `@/components/ui/Icon` 使用图标，不直接导入 SVG 文件。

## 目录

- `source/sprites`：单色小图标，生成 inline sprite，并通过 `currentColor` 着色。
- `source/svgrs`：多色、渐变或需要人工维护主题变量的 SVG。
- `source/configurable-icons`：用于向后台配置端交付可选图标，不参与生成。
- `generated`：脚本生成的 sprite、类型、注册表和 SVGR TSX。

## 使用

新增或删除 SVG 后执行：

```bash
pnpm gen-svg
```

```tsx
<Icon name="tabbar_home" className="size-6 text-green-500" />
<Icon name="https://cdn.example.com/icon.svg" color="#31ED87" />
<Icon name="https://cdn.example.com/image.png" />
```

本地图标名称和 HTTP(S) URL 都通过 `name` 传入。远程 `.svg` 在传入 `color` 时使用
CSS mask 着色，否则与其他远程图片一样使用 `img`。

后台接口返回普通字符串时，先使用 `@/components/ui/Icon/icon-name` 导出的 `isIconName`
完成运行时校验，再传给 `Icon`。

## SVGR 维护规则

- source 存在且对应 TSX 不存在时才会生成。
- 已生成的 TSX 不会被脚本改写，可以手动接入 CSS 变量和主题逻辑。
- 如需根据更新后的 source 重新生成，先删除对应的 generated TSX。
- 删除 source 后，脚本会同步删除对应的 generated TSX。
- `generated/index.ts`、`generated/svgPath_all.ts` 和 `generated/sprite-svg.tsx` 不要手动修改。

Sprite 图标预览页生成在 `public/sprite-preview.html`。
