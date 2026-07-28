import { generateSvgrComponents } from './gen-icons.js';
import { generateSvgTypesAndRegistry } from './gen-svg-types.js';
import { generateInlineSpriteTsx } from './generate-inline-sprite.js';
import { generateSpriteSvg } from './generate-sprite.js';

async function main() {
  console.log('开始生成 SVG 资源...');

  const spriteResult = await generateSpriteSvg();
  await generateInlineSpriteTsx(spriteResult.publicSpriteFile);
  console.log(`sprite 完成，共 ${spriteResult.spriteNames.length} 个`);

  const svgrResult = await generateSvgrComponents();
  console.log(
    `svgr 完成，共 ${svgrResult.names.length} 个，新增 ${svgrResult.stats.created.length}，保留 ${svgrResult.stats.skipped.length}，删除 ${svgrResult.stats.removed.length}`,
  );

  await generateSvgTypesAndRegistry({
    spriteNames: spriteResult.spriteNames,
    svgrNames: svgrResult.names,
  });
  console.log('SVG 类型与注册表完成');
}

main().catch((error: unknown) => {
  console.error('SVG 生成失败：', error);
  process.exit(1);
});
