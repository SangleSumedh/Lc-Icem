// utils/sendResponse.js

/**
 * Standardized response helper
 * @param {Object} res - Express response object
 * @param {Boolean} success - Indicates success or failure
 * @param {String} message - Response message
 * @param {Object|null} data - Optional payload
 * @param {Number} status - HTTP status code (default: 200)
 */
export const sendResponse = (
  res,
  success,
  message,
  data = null,
  status = 200
) => {
  return res.status(status).json({
    success,
    message,
    data,
  });
};
