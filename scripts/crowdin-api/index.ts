import { existsSync } from 'node:fs';
import { relative } from 'node:path';

import { CrowdinService } from './client.js';
import { logCommand, logDetail, logDone, logError, logInfo, logNext } from './logger.js';
import { PROJECT_ROOT } from './paths.js';
import { getCreateSourcePath, listSourceFiles, resolveSourceFile } from './source-files.js';
import { buildLocales, writeTranslationFile } from './translations.js';

type RemoteOptions = {
  all: boolean;
  approvedOnly: boolean;
  selector?: string;
};

function parseRemoteOptions(args: string[], allowApprovedOnly: boolean): RemoteOptions {
  const all = args.includes('--all');
  const approvedOnly = args.includes('--approved-only');
  const unknownFlags = args.filter(
    (arg) => arg.startsWith('--') && arg !== '--all' && arg !== '--approved-only',
  );
  if (unknownFlags.length > 0) {
    throw new Error(`不支持的参数: ${unknownFlags.join(', ')}`);
  }
  if (approvedOnly && !allowApprovedOnly) {
    throw new Error('--approved-only 只适用于 pull');
  }

  const positional = args.filter((arg) => !arg.startsWith('--'));
  if (positional.length > 1) {
    throw new Error('最多只能指定一个 source 文件或任务标识');
  }
  if (all && positional.length > 0) {
    throw new Error('--all 不能和指定文件同时使用');
  }

  return { all, approvedOnly, selector: positional[0] };
}

function selectSourceFiles(options: RemoteOptions) {
  const files = options.all ? listSourceFiles() : [resolveSourceFile(options.selector)];
  if (files.length === 0) throw new Error('没有可处理的 source 文件');
  return files;
}

function printFiles(label: string, files: string[]) {
  if (files.length === 1) {
    logInfo(`${label}: ${relative(PROJECT_ROOT, files[0])}`);
    return;
  }

  logInfo(`${label}: ${files.length} 个 source`);
  for (const file of files) logDetail(relative(PROJECT_ROOT, file));
}

function printHelp() {
  console.log(`
Crowdin 多人协作工具

用法:
  pnpm crowdin:create [名称]
  pnpm crowdin:check
  pnpm crowdin:merge
  pnpm crowdin:push [文件或任务号]
  pnpm crowdin:push -- --all
  pnpm crowdin:pull [文件或任务号] [--approved-only]
  pnpm crowdin:pull -- --all [--approved-only]
`);
}

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'create': {
      logCommand('create', '创建中文 source');
      if (args.length > 1) throw new Error('create 最多只能指定一个名称');
      const filePath = getCreateSourcePath(args[0]);
      if (existsSync(filePath)) throw new Error(`source 文件已存在: ${filePath}`);

      writeTranslationFile(filePath, {});
      logDone(`source 已创建: ${relative(PROJECT_ROOT, filePath)}`);
      logNext('填写中文后执行: pnpm crowdin:merge');
      break;
    }

    case 'check':
      logCommand('check', '检查本地翻译资源');
      if (args.length > 0) throw new Error('check 不接受参数');
      buildLocales({ write: false, strictTranslations: true });
      logDone('检查通过');
      break;

    case 'merge':
      logCommand('merge', '生成应用语言包');
      if (args.length > 0) throw new Error('merge 不接受参数');
      buildLocales({ write: true });
      logDone('locale 已同步');
      logNext('需要上传时执行: pnpm crowdin:push');
      break;

    case 'push': {
      logCommand('push', '上传中文 source');
      const options = parseRemoteOptions(args, false);
      const files = selectSourceFiles(options);

      printFiles('source', files);
      buildLocales({ write: true, logSummary: false });

      const result = await new CrowdinService().uploadSourceFiles(files);
      logDone(`上传完成: ${result.created} 新建 / ${result.updated} 更新`);
      logNext('翻译完成后执行: pnpm crowdin:pull');
      break;
    }

    case 'pull': {
      logCommand('pull', '下载专业翻译');
      const options = parseRemoteOptions(args, true);
      const files = selectSourceFiles(options);

      printFiles('source', files);
      logInfo(options.approvedOnly ? '范围: 已批准翻译' : '范围: 最新翻译');
      buildLocales({ write: false, logSummary: false });

      const result = await new CrowdinService().downloadTranslations(files, {
        approvedOnly: options.approvedOnly,
      });

      buildLocales({ write: true, logSummary: false });
      logDone(`下载完成: ${result.updated} 个翻译分片`);
      logNext('检查 downloads/locales 后提交');
      break;
    }

    case '--help':
    case '-h':
    case 'help':
    case undefined:
      printHelp();
      break;

    default:
      throw new Error(`未知命令: ${command}`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  logError(`命令失败: ${message}`);
  process.exitCode = 1;
});
