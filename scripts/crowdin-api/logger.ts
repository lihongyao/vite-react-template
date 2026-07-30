const prefix = {
  command: '[Crowdin]',
  info: '📒：',
  detail: '  - ',
  progress: '进度：',
  done: '🎉：',
  warn: '🔔：',
  error: '❌：',
  next: '👉：',
} as const;

/** 统一 CLI 输出格式，保证本地终端和 CI 日志都容易检索。 */
export function logCommand(command: string, description: string) {
  console.log(`\n${prefix.command} ${command} - ${description}\n`);
}

export function logInfo(message: string) {
  console.log(`${prefix.info}${message}`);
}

export function logDetail(message: string) {
  console.log(`${prefix.detail}${message}`);
}

export function logProgress(current: number, total: number, message: string) {
  console.log(`${prefix.progress}${current}/${total} ${message}`);
}

export function logDone(message: string) {
  console.log(`${prefix.done}${message}`);
}

export function logWarn(message: string) {
  console.log(`${prefix.warn}${message}`);
}

export function logError(message: string) {
  console.error(`${prefix.error}${message}`);
}

export function logNext(message: string) {
  console.log(`${prefix.next}${message}`);
}
