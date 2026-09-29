export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || "Something went wrong";

  const errors = err.errors || [];

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
