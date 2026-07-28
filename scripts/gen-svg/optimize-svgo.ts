import type { Config } from 'svgo';
import { optimize } from 'svgo';

const SVGO_CONFIG: Config = {
  plugins: ['preset-default', 'removeDimensions'],
};

export function optimizeSvgContent(content: string, filePath: string): string {
  const optimized = optimize(content, {
    path: filePath,
    ...SVGO_CONFIG,
  });
  return optimized.data || content;
}
