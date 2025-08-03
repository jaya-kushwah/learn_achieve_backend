exports.successResponse = (res, message = "Success", data = {}) => {
  return res.status(200).json({
    success: true,
    message,
    data
  });
};

exports.errorResponse = (res, message = "Something went wrong", code = 500) => {
  return res.status(code).json({
    success: false,
    message
  });
};