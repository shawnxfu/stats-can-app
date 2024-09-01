import { configureStore } from '@reduxjs/toolkit';
import contentReducer from '../features/content_view/contentSlice';

export default configureStore({
  reducer: {
    content: contentReducer,
  }
});