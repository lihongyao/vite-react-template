/**
 * 将 Blob 保存为本地文件，并在触发下载后释放临时 Object URL。
 *
 * @param blob 要下载的文件数据。
 * @param fileName 下载时使用的文件名，建议包含扩展名。
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = 'none';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 将 Blob 转换为包含 MIME 类型的 Base64 Data URL。
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener(
      'load',
      () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }

        reject(new Error('Failed to convert Blob to Base64'));
      },
      { once: true },
    );
    reader.addEventListener(
      'error',
      () => {
        reject(reader.error ?? new Error('Failed to read Blob'));
      },
      { once: true },
    );
    reader.addEventListener(
      'abort',
      () => {
        reject(new DOMException('Blob reading was aborted', 'AbortError'));
      },
      { once: true },
    );

    reader.readAsDataURL(blob);
  });
}
