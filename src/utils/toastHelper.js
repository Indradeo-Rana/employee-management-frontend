import { toast } from "react-toastify";

/**
 * Show success toast notification
 * @param {string} message - Success message to display
 * @param {object} options - Optional toast configuration
 */
export const showSuccess = (message, options = {}) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

/**
 * Show error toast notification
 * @param {string} message - Error message to display
 * @param {object} options - Optional toast configuration
 */
export const showError = (message, options = {}) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

/**
 * Show warning toast notification
 * @param {string} message - Warning message to display
 * @param {object} options - Optional toast configuration
 */
export const showWarning = (message, options = {}) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

/**
 * Show info toast notification
 * @param {string} message - Info message to display
 * @param {object} options - Optional toast configuration
 */
export const showInfo = (message, options = {}) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

/**
 * Extract and show error message from API response
 * @param {object} error - Axios error object
 * @param {string} fallback - Fallback message if no error details available
 */
export const handleApiError = (error, fallback = "An error occurred") => {
  const message = error?.response?.data?.message || fallback;
  showError(message);
};
