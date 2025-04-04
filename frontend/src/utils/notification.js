import { store } from '../store';
import { showNotification, clearNotification } from '../store/slices/uiSlice';

const notification = {
  success: (message, duration = 5000) => {
    store.dispatch(
      showNotification({
        message,
        type: 'success',
        duration,
      })
    );
    
    if (duration > 0) {
      setTimeout(() => {
        store.dispatch(clearNotification());
      }, duration);
    }
  },
  
  error: (message, duration = 5000) => {
    store.dispatch(
      showNotification({
        message,
        type: 'error',
        duration,
      })
    );
    
    if (duration > 0) {
      setTimeout(() => {
        store.dispatch(clearNotification());
      }, duration);
    }
  },
  
  warning: (message, duration = 5000) => {
    store.dispatch(
      showNotification({
        message,
        type: 'warning',
        duration,
      })
    );
    
    if (duration > 0) {
      setTimeout(() => {
        store.dispatch(clearNotification());
      }, duration);
    }
  },
  
  info: (message, duration = 5000) => {
    store.dispatch(
      showNotification({
        message,
        type: 'info',
        duration,
      })
    );
    
    if (duration > 0) {
      setTimeout(() => {
        store.dispatch(clearNotification());
      }, duration);
    }
  },
  
  clear: () => {
    store.dispatch(clearNotification());
  },
};

export default notification;