import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { setLogoutHandler } from '../services/api';
import { logout } from './slices/authSlice';
import { injectStore } from '../services/api';

// Import slices
import authReducer from './slices/authSlice';
import documentReducer from './slices/documentSlice';
import clientReducer from './slices/clientSlice';
import uiReducer from './slices/uiSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // only auth will be persisted
};

const rootReducer = combineReducers({
  auth: authReducer,
  documents: documentReducer,
  clients: clientReducer,
  ui: uiReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Set the logout handler to dispatch the logout action
// setLogoutHandler(() => {
//   store.dispatch(logout());
// });

window.store = store;
injectStore(store);


export const persistor = persistStore(store);