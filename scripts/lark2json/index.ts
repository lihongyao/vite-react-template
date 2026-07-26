import * as lark from '@larksuiteoapi/node-sdk';

const BASE_URL =
  'https://bjmqf12dh24.sg.larksuite.com/base/SzOabKtyPaqCIxsqHqmlWqPXguh?table=tblUPYq4WgBnl0Oy&view=vewjP1MP4E';
const SILENT_LOGGER = {
  error: () => undefined,
  warn: () => undefined,
  info: () => undefined,
  debug: () => undefined,
  trace: () => undefined,
};

function getRequiredEnv(name: 'LARK_APP_ID' | 'LARK_APP_SECRET') {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parseBaseUrl(baseUrl: string) {
  const url = new URL(baseUrl);
  const appToken = url.pathname.split('/').filter(Boolean).at(-1);
  const tableId = url.searchParams.get('table');
  const viewId = url.searchParams.get('view');

  if (!appToken || !tableId) {
    throw new Error('Invalid Lark Base URL: app token or table ID is missing');
  }

  return { appToken, tableId, viewId };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function formatError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (!isRecord(error) || !isRecord(error.response)) {
    return message;
  }

  const { data } = error.response;

  return data ? `${message}\n${JSON.stringify(data, null, 2)}` : message;
}

async function main() {
  const client = new lark.Client({
    appId: getRequiredEnv('LARK_APP_ID'),
    appSecret: getRequiredEnv('LARK_APP_SECRET'),
    appType: lark.AppType.SelfBuild,
    domain: lark.Domain.Lark,
    loggerLevel: lark.LoggerLevel.fatal,
    logger: SILENT_LOGGER,
  });
  const { appToken, tableId, viewId } = parseBaseUrl(BASE_URL);
  const records: unknown[] = [];
  let pageToken: string | undefined;

  do {
    const response = await client.bitable.appTableRecord.list({
      path: {
        app_token: appToken,
        table_id: tableId,
      },
      params: {
        page_size: 500,
        page_token: pageToken,
        ...(viewId ? { view_id: viewId } : {}),
      },
    });

    if (response.code !== 0) {
      throw new Error(`Lark API error ${response.code}: ${response.msg}`);
    }

    records.push(...(response.data?.items ?? []));

    if (response.data?.has_more && !response.data.page_token) {
      throw new Error('Lark API returned has_more without a page_token');
    }

    pageToken = response.data?.has_more ? response.data.page_token : undefined;
  } while (pageToken);

  console.log(JSON.stringify(records, null, 2));
}

main().catch((error: unknown) => {
  console.error(formatError(error));
  process.exitCode = 1;
});
