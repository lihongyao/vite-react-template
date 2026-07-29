/**
 * Telegram Mini Apps global types.
 *
 * Official docs: https://core.telegram.org/bots/webapps#initializing-mini-apps
 *
 * Telegram currently provides the JavaScript bridge
 * (`https://telegram.org/js/telegram-web-app.js`) but not an official `.d.ts`
 * file, so this declaration mirrors the public WebApp API documented there.
 */

declare namespace Telegram {
  type StringWithAutocomplete<T extends string> = T | (string & {});

  type RGBColor = string;
  type HeaderColor = StringWithAutocomplete<'bg_color' | 'secondary_bg_color'>;
  type BackgroundColor = StringWithAutocomplete<'bg_color' | 'secondary_bg_color'>;
  type BottomBarColor = StringWithAutocomplete<
    'bg_color' | 'secondary_bg_color' | 'bottom_bar_bg_color'
  >;

  type Platform = StringWithAutocomplete<
    'android' | 'android_x' | 'ios' | 'macos' | 'tdesktop' | 'web' | 'weba' | 'webk' | 'unknown'
  >;

  type ColorScheme = 'light' | 'dark';
  type ChatType = StringWithAutocomplete<'sender' | 'private' | 'group' | 'supergroup' | 'channel'>;
  type ChooseChatType = 'users' | 'bots' | 'groups' | 'channels';
  type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending';
  type HomeScreenStatus = 'unsupported' | 'unknown' | 'added' | 'missed';
  type PopupButtonType = 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
  type BottomButtonType = 'main' | 'secondary';
  type BottomButtonPosition = 'left' | 'right' | 'top' | 'bottom';
  type HapticImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
  type HapticNotificationType = 'error' | 'success' | 'warning';
  type BiometricType = 'finger' | 'face' | 'unknown';
  type PermissionStatus = 'allowed' | 'cancelled';
  type ContactRequestedStatus = 'sent' | 'cancelled';
  type FileDownloadStatus = 'downloading' | 'cancelled';
  type FullscreenError = 'UNSUPPORTED' | 'ALREADY_FULLSCREEN';
  type SensorError = 'UNSUPPORTED';
  type ShareMessageError =
    'UNSUPPORTED' | 'MESSAGE_EXPIRED' | 'MESSAGE_SEND_FAILED' | 'USER_DECLINED' | 'UNKNOWN_ERROR';
  type EmojiStatusError =
    | 'UNSUPPORTED'
    | 'SUGGESTED_EMOJI_INVALID'
    | 'DURATION_INVALID'
    | 'USER_DECLINED'
    | 'SERVER_ERROR'
    | 'UNKNOWN_ERROR';
  type StorageError = string | null;

  interface TelegramNamespace {
    WebApp?: WebApp;
  }

  interface WebApp {
    /** Mini App 收到的原始初始化数据，通常发到服务端校验。 */
    initData: string;
    /** 已解析的初始化数据；仅供前端展示使用，不能直接信任。 */
    initDataUnsafe: WebAppInitData;
    /** 当前 Telegram 客户端支持的 Bot API 版本。 */
    version: string;
    /** 用户打开 Mini App 时所处的 Telegram 平台。 */
    platform: Platform;
    /** Telegram 当前主题色模式。 */
    colorScheme: ColorScheme;
    /** Telegram 当前主题参数，可用于同步页面视觉。 */
    themeParams: ThemeParams;
    /** Mini App 当前是否处于激活状态。 */
    isActive: boolean;
    /** Mini App 是否已展开到最大可用高度。 */
    isExpanded: boolean;
    /** 当前可见区域高度，会随拖拽或动画实时变化。 */
    viewportHeight: number;
    /** 最近一次稳定状态下的可见区域高度。 */
    viewportStableHeight: number;
    /** 当前头部颜色，通常为 #RRGGBB。 */
    headerColor: RGBColor;
    /** 当前背景颜色，通常为 #RRGGBB。 */
    backgroundColor: RGBColor;
    /** 当前底部栏颜色，通常为 #RRGGBB。 */
    bottomBarColor: RGBColor;
    /** 用户关闭 Mini App 时是否启用二次确认。 */
    isClosingConfirmationEnabled: boolean;
    /** 是否允许通过纵向滑动关闭或最小化 Mini App。 */
    isVerticalSwipesEnabled: boolean;
    /** Mini App 当前是否以全屏模式显示。 */
    isFullscreen: boolean;
    /** 当前是否锁定了 Mini App 的屏幕方向。 */
    isOrientationLocked: boolean;
    /** 设备安全区域边距，例如刘海屏或系统导航区域。 */
    safeAreaInset: SafeAreaInset;
    /** 内容展示区域的安全边距，避开 Telegram UI 覆盖。 */
    contentSafeAreaInset: ContentSafeAreaInset;
    /** 控制 Telegram 顶部返回按钮。 */
    BackButton: BackButton;
    /** 控制底部主按钮。 */
    MainButton: BottomButton;
    /** 控制底部辅助按钮。 */
    SecondaryButton: BottomButton;
    /** 控制右上角上下文菜单里的 Settings 项。 */
    SettingsButton: SettingsButton;
    /** 触发 Telegram 客户端的触觉反馈。 */
    HapticFeedback: HapticFeedback;
    /** 使用 Telegram 云端存储保存少量键值数据。 */
    CloudStorage: CloudStorage;
    /** 控制设备生物识别能力和本地 biometric token。 */
    BiometricManager: BiometricManager;
    /** 读取设备加速度计数据。 */
    Accelerometer: Accelerometer;
    /** 读取设备方向数据。 */
    DeviceOrientation: DeviceOrientation;
    /** 读取设备陀螺仪数据。 */
    Gyroscope: Gyroscope;
    /** 控制位置权限并读取当前位置。 */
    LocationManager: LocationManager;
    /** 使用设备本地存储保存键值数据。 */
    DeviceStorage: DeviceStorage;
    /** 使用设备安全存储保存敏感键值数据。 */
    SecureStorage: SecureStorage;

    /** 判断当前客户端是否至少支持指定 Bot API 版本。 */
    isVersionAtLeast(version: string): boolean;
    /** 设置 Mini App 头部颜色。 */
    setHeaderColor(color: HeaderColor): void;
    /** 设置 Mini App 背景颜色。 */
    setBackgroundColor(color: BackgroundColor): void;
    /** 设置底部栏颜色，Android 上也会影响导航栏。 */
    setBottomBarColor(color: BottomBarColor): void;
    /** 开启关闭 Mini App 前的确认弹窗。 */
    enableClosingConfirmation(): void;
    /** 关闭退出确认弹窗。 */
    disableClosingConfirmation(): void;
    /** 开启纵向滑动关闭或最小化。 */
    enableVerticalSwipes(): void;
    /** 关闭纵向滑动，适合页面自身手势冲突时使用。 */
    disableVerticalSwipes(): void;
    /** 请求进入全屏模式。 */
    requestFullscreen(): void;
    /** 请求退出全屏模式。 */
    exitFullscreen(): void;
    /** 将 Mini App 锁定在当前屏幕方向。 */
    lockOrientation(): void;
    /** 解除屏幕方向锁定。 */
    unlockOrientation(): void;
    /** 请求把 Mini App 添加到用户主屏幕。 */
    addToHomeScreen(): void;
    /** 检查添加到主屏幕的支持状态或已有状态。 */
    checkHomeScreenStatus(callback?: (status: HomeScreenStatus) => void): void;
    /** 注册 Telegram Mini App 事件监听。 */
    onEvent<TEvent extends WebAppEventType>(
      eventType: TEvent,
      eventHandler: WebAppEventHandler<TEvent>,
    ): void;
    onEvent(eventType: string, eventHandler: (this: WebApp, ...args: any[]) => void): void;
    /** 移除之前注册的 Telegram Mini App 事件监听。 */
    offEvent<TEvent extends WebAppEventType>(
      eventType: TEvent,
      eventHandler: WebAppEventHandler<TEvent>,
    ): void;
    offEvent(eventType: string, eventHandler: (this: WebApp, ...args: any[]) => void): void;
    /** 向 bot 发送数据并关闭 Mini App，仅适用于 Keyboard Button 启动场景。 */
    sendData(data: string): void;
    /** 切回 Telegram inline mode，并填入指定查询内容。 */
    switchInlineQuery(query: string, choose_chat_types?: ChooseChatType[]): void;
    /** 在外部浏览器打开链接，Mini App 不会因此关闭。 */
    openLink(url: string, options?: OpenLinkOptions): void;
    /** 在 Telegram 内打开 t.me 链接。 */
    openTelegramLink(url: string): void;
    /** 打开 Telegram invoice，并在关闭时返回支付状态。 */
    openInvoice(url: string, callback?: (status: InvoiceStatus) => void): void;
    /** 打开原生 story 编辑器分享指定媒体。 */
    shareToStory(media_url: string, params?: StoryShareParams): void;
    /** 打开分享对话框，让用户分享 bot 准备好的消息。 */
    shareMessage(msg_id: string, callback?: (isSent: boolean) => void): void;
    /** 请求用户把指定 custom emoji 设置为状态。 */
    setEmojiStatus(custom_emoji_id: string, callback?: (isSet: boolean) => void): void;
    setEmojiStatus(
      custom_emoji_id: string,
      params?: EmojiStatusParams,
      callback?: (isSet: boolean) => void,
    ): void;
    /** 请求用户授权 bot 管理 emoji 状态。 */
    requestEmojiStatusAccess(callback?: (isGranted: boolean) => void): void;
    /** 显示原生文件下载确认弹窗。 */
    downloadFile(params: DownloadFileParams, callback?: (isAccepted: boolean) => void): void;
    /** 隐藏当前激活的屏幕键盘。 */
    hideKeyboard(): void;
    /** 显示 Telegram 原生弹窗。 */
    showPopup(params: PopupParams, callback?: (buttonId: string | null) => void): void;
    /** 显示只有关闭按钮的提示弹窗。 */
    showAlert(message: string, callback?: () => void): void;
    /** 显示确认弹窗，并返回用户是否确认。 */
    showConfirm(message: string, callback?: (isConfirmed: boolean) => void): void;
    /** 打开原生二维码扫描弹窗。 */
    showScanQrPopup(params: ScanQrPopupParams, callback?: (data: string) => boolean | void): void;
    /** 关闭由 showScanQrPopup 打开的二维码扫描弹窗。 */
    closeScanQrPopup(): void;
    /** 在用户交互后请求读取剪贴板文本。 */
    readTextFromClipboard(callback?: (data: string | null) => void): void;
    /** 请求用户授权 bot 主动发送私聊消息。 */
    requestWriteAccess(callback?: (isGranted: boolean) => void): void;
    /** 请求用户分享手机号。 */
    requestContact(callback?: (isShared: boolean) => void): void;
    /** 打开会话选择弹窗，req_id 来自 Bot API 预生成的按钮。 */
    requestChat(req_id: string, callback?: (isSent: boolean) => void): void;
    /** 通知 Telegram Mini App 已完成关键 UI 加载，可以展示。 */
    ready(): void;
    /** 将 Mini App 展开到最大可用高度。 */
    expand(): void;
    /** 关闭 Mini App。 */
    close(): void;
  }

  interface WebAppEventPayloadMap {
    activated: void;
    deactivated: void;
    themeChanged: void;
    viewportChanged: { isStateStable: boolean };
    safeAreaChanged: void;
    contentSafeAreaChanged: void;
    mainButtonClicked: void;
    secondaryButtonClicked: void;
    backButtonClicked: void;
    settingsButtonClicked: void;
    invoiceClosed: { url: string; status: InvoiceStatus };
    popupClosed: { button_id: string | null };
    qrTextReceived: { data: string };
    scanQrPopupClosed: void;
    clipboardTextReceived: { data: string | null };
    writeAccessRequested: { status: PermissionStatus };
    contactRequested: { status: ContactRequestedStatus };
    biometricManagerUpdated: void;
    biometricAuthRequested: {
      isAuthenticated: boolean;
      biometricToken?: string;
    };
    biometricTokenUpdated: { isUpdated: boolean };
    fullscreenChanged: void;
    fullscreenFailed: { error: FullscreenError };
    homeScreenAdded: void;
    homeScreenChecked: { status: HomeScreenStatus };
    accelerometerStarted: void;
    accelerometerStopped: void;
    accelerometerChanged: void;
    accelerometerFailed: { error: SensorError };
    deviceOrientationStarted: void;
    deviceOrientationStopped: void;
    deviceOrientationChanged: void;
    deviceOrientationFailed: { error: SensorError };
    gyroscopeStarted: void;
    gyroscopeStopped: void;
    gyroscopeChanged: void;
    gyroscopeFailed: { error: SensorError };
    locationManagerUpdated: void;
    locationRequested: { locationData: LocationData };
    shareMessageSent: void;
    shareMessageFailed: { error: ShareMessageError };
    emojiStatusSet: void;
    emojiStatusFailed: { error: EmojiStatusError };
    emojiStatusAccessRequested: { status: PermissionStatus };
    fileDownloadRequested: { status: FileDownloadStatus };
  }

  type WebAppEventType = keyof WebAppEventPayloadMap;

  type WebAppEventHandler<TEvent extends WebAppEventType> =
    WebAppEventPayloadMap[TEvent] extends void
      ? (this: WebApp) => void
      : (this: WebApp, event: WebAppEventPayloadMap[TEvent]) => void;

  interface ThemeParams {
    bg_color?: RGBColor;
    text_color?: RGBColor;
    hint_color?: RGBColor;
    link_color?: RGBColor;
    button_color?: RGBColor;
    button_text_color?: RGBColor;
    secondary_bg_color?: RGBColor;
    header_bg_color?: RGBColor;
    bottom_bar_bg_color?: RGBColor;
    accent_text_color?: RGBColor;
    section_bg_color?: RGBColor;
    section_header_text_color?: RGBColor;
    section_separator_color?: RGBColor;
    subtitle_text_color?: RGBColor;
    destructive_text_color?: RGBColor;
  }

  interface StoryShareParams {
    text?: string;
    widget_link?: StoryWidgetLink;
  }

  interface StoryWidgetLink {
    url: string;
    name?: string;
  }

  interface ScanQrPopupParams {
    text?: string;
  }

  interface PopupParams {
    title?: string;
    message: string;
    buttons?: PopupButton[];
  }

  interface PopupButton {
    id?: string;
    type?: PopupButtonType;
    text?: string;
  }

  interface EmojiStatusParams {
    duration?: number;
  }

  interface DownloadFileParams {
    url: string;
    file_name: string;
  }

  interface SafeAreaInset {
    top: number;
    bottom: number;
    left: number;
    right: number;
  }

  interface ContentSafeAreaInset {
    top: number;
    bottom: number;
    left: number;
    right: number;
  }

  interface BackButton {
    isVisible: boolean;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
  }

  interface BottomButton {
    readonly type: BottomButtonType;
    iconCustomEmojiId: string;
    text: string;
    color: RGBColor;
    textColor: RGBColor;
    isVisible: boolean;
    isActive: boolean;
    hasShineEffect: boolean;
    position?: BottomButtonPosition;
    readonly isProgressVisible: boolean;
    setText(text: string): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
    setParams(params: BottomButtonParams): void;
  }

  interface BottomButtonParams {
    icon_custom_emoji_id?: string;
    text?: string;
    color?: RGBColor;
    text_color?: RGBColor;
    has_shine_effect?: boolean;
    position?: BottomButtonPosition;
    is_active?: boolean;
    is_visible?: boolean;
  }

  interface SettingsButton {
    isVisible: boolean;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
  }

  interface HapticFeedback {
    impactOccurred(style: HapticImpactStyle): void;
    notificationOccurred(type: HapticNotificationType): void;
    selectionChanged(): void;
  }

  interface CloudStorage {
    setItem(
      key: string,
      value: string,
      callback?: (error: StorageError, isStored?: boolean) => void,
    ): void;
    getItem(key: string, callback: (error: StorageError, value?: string) => void): void;
    getItems(
      keys: string[],
      callback: (error: StorageError, values?: Record<string, string>) => void,
    ): void;
    removeItem(key: string, callback?: (error: StorageError, isRemoved?: boolean) => void): void;
    removeItems(
      keys: string[],
      callback?: (error: StorageError, isRemoved?: boolean) => void,
    ): void;
    getKeys(callback: (error: StorageError, keys?: string[]) => void): void;
  }

  interface BiometricManager {
    isInited: boolean;
    isBiometricAvailable: boolean;
    biometricType: BiometricType;
    isAccessRequested: boolean;
    isAccessGranted: boolean;
    isBiometricTokenSaved: boolean;
    deviceId: string;
    init(callback?: () => void): void;
    requestAccess(
      params: BiometricRequestAccessParams,
      callback?: (isGranted: boolean) => void,
    ): void;
    authenticate(
      params: BiometricAuthenticateParams,
      callback?: (isAuthenticated: boolean, biometricToken?: string) => void,
    ): void;
    updateBiometricToken(token: string, callback?: (isUpdated: boolean) => void): void;
    openSettings(): void;
  }

  interface BiometricRequestAccessParams {
    reason?: string;
  }

  interface BiometricAuthenticateParams {
    reason?: string;
  }

  interface Accelerometer {
    isStarted: boolean;
    x: number;
    y: number;
    z: number;
    start(params?: AccelerometerStartParams, callback?: (isStarted: boolean) => void): void;
    stop(callback?: (isStopped: boolean) => void): void;
  }

  interface AccelerometerStartParams {
    refresh_rate?: number;
  }

  interface DeviceOrientation {
    isStarted: boolean;
    absolute: boolean;
    alpha: number;
    beta: number;
    gamma: number;
    start(params?: DeviceOrientationStartParams, callback?: (isStarted: boolean) => void): void;
    stop(callback?: (isStopped: boolean) => void): void;
  }

  interface DeviceOrientationStartParams {
    refresh_rate?: number;
    need_absolute?: boolean;
  }

  interface Gyroscope {
    isStarted: boolean;
    x: number;
    y: number;
    z: number;
    start(params?: GyroscopeStartParams, callback?: (isStarted: boolean) => void): void;
    stop(callback?: (isStopped: boolean) => void): void;
  }

  interface GyroscopeStartParams {
    refresh_rate?: number;
  }

  interface LocationManager {
    isInited: boolean;
    isLocationAvailable: boolean;
    isAccessRequested: boolean;
    isAccessGranted: boolean;
    init(callback?: () => void): void;
    getLocation(callback: (locationData: LocationData | null) => void): void;
    openSettings(): void;
  }

  interface LocationData {
    latitude: number;
    longitude: number;
    altitude: number | null;
    course: number | null;
    speed: number | null;
    horizontal_accuracy: number | null;
    vertical_accuracy: number | null;
    course_accuracy: number | null;
    speed_accuracy: number | null;
  }

  interface DeviceStorage {
    setItem(
      key: string,
      value: string,
      callback?: (error: StorageError, isStored?: boolean) => void,
    ): void;
    getItem(key: string, callback: (error: StorageError, value?: string) => void): void;
    removeItem(key: string, callback?: (error: StorageError, isRemoved?: boolean) => void): void;
    clear(callback?: (error: StorageError, isCleared?: boolean) => void): void;
  }

  interface SecureStorage {
    setItem(
      key: string,
      value: string,
      callback?: (error: StorageError, isStored?: boolean) => void,
    ): void;
    getItem(
      key: string,
      callback: (error: StorageError, value?: string | null, canRestore?: boolean) => void,
    ): void;
    restoreItem(key: string, callback?: (error: StorageError, value?: string) => void): void;
    removeItem(key: string, callback?: (error: StorageError, isRemoved?: boolean) => void): void;
    clear(callback?: (error: StorageError, isCleared?: boolean) => void): void;
  }

  interface OpenLinkOptions {
    try_instant_view?: boolean;
  }

  interface WebAppInitData {
    query_id?: string;
    user?: WebAppUser;
    receiver?: WebAppUser;
    chat?: WebAppChat;
    chat_type?: ChatType;
    chat_instance?: string;
    start_param?: string;
    can_send_after?: number;
    auth_date: number;
    hash: string;
    signature?: string;
  }

  interface WebAppUser {
    id: number;
    is_bot?: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: true;
    added_to_attachment_menu?: true;
    allows_write_to_pm?: true;
    photo_url?: string;
  }

  interface WebAppChat {
    id: number;
    type: 'group' | 'supergroup' | 'channel';
    title: string;
    username?: string;
    photo_url?: string;
  }
}

interface Window {
  /** Telegram Mini App */
  Telegram?: Telegram.TelegramNamespace;
}
