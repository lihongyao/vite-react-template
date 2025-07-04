
/**
 * Redux Store 配置入口
 * 集成 redux - persist 实现状态持久化（localStorage）
 * 使用 redux-persist-transform-filter 过滤特定字段
 * pnpm add react-redux @reduxjs/toolkit redux-persist redux-persist-transform-filter
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { createBlacklistFilter } from 'redux-persist-transform-filter';
import storage from 'redux-persist/lib/storage'; // 默认使用 localStorage
import appReducer from './slices/appSlice';
// =============================================
// 持久化配置（字段级过滤）
// =============================================
const courseFilter = createBlacklistFilter('app', []);

const persistConfig = {
  key: 'reduxState',
  storage,
  transforms: [courseFilter],
};

// 👉 合并所有 reducer 并添加持久化能力
const persistedReducer = persistReducer(
  persistConfig,
  // @ts-ignore
  combineReducers({
    app: appReducer,
  }),

);

// =============================================
// Redux Store 配置
// =============================================
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false // 关闭序列化检查（避免 redux-persist 的警告）
    }),
});

// 👉 创建持久化 store 实例
export const persistor = persistStore(store);

// =============================================
// 类型导出（TypeScript 专用）
// =============================================
export type AppDispatch = typeof store.dispatch;  // 用于 dispatch 类型推断
export type RootState = ReturnType<typeof store.getState>;
