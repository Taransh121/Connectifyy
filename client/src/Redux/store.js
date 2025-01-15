import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice'; // Import user slice
import chatReducer from './chatSlice'; // Import chat slice
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Combine reducers (user and chat)
const rootReducer = combineReducers({
    user: userReducer,
    chat: chatReducer,
});

// Persist configuration
const persistConfig = {
    key: 'root',
    storage,
    version: 1,
};

// Apply persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the Redux store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);
