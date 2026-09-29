export const successResponse = (res, message, data = null, meta = {}, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
};

export const errorResponse = (res, message, errors = [], statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
