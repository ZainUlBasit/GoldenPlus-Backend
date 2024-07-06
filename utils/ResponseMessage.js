const createError = (res, status, message) => {
    const err = new Error();
    err.status = status;
    err.msg = message;
    return res.status(400).json({ success: false, error: err });
  };
  
  const successMessage = (res, payload, data_msg) => {
    return res
      .status(200)
      .json({ success: true, data: { payload, msg: data_msg } });
  };
  
  module.exports = { createError, successMessage };
  