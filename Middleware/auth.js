const JwtService = require("../Services/JwtServices");
const { createError } = require("../utils/ResponseMessage");
const jwt = require("jsonwebtoken");
const privateKey = process.env.ACCESS_SECRET_KEY;

const VerifyUserCookie = async (req, res, next) => {
  let token = req.headers["token"] || null;
  if (!token) return createError(res, 401, "Not Logged In!");
  try {
    const user = await jwt.verify(token, privateKey);
    if (user) {
      req.user = user;
      next();
      return;
    } else {
      return createError(res, 403, "Invalid token!");
    }
  } catch (error) {
    return createError(res, 400, error);
  }
};
const VerifyBranch = async (req, res, next) => {
  try {
    if (req.user.role !== 2)
      throw new Error("Unauthorized to access this route!");
    next();
  } catch (error) {
    return createError(res, 401, error.message);
  }
};
const VerifyAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 1)
      throw new Error("Unauthorized to access this route!");
    next();
  } catch (error) {
    return createError(res, 401, error.message);
  }
};
const VerifyBranchId = async (req, res, next) => {
  try {
    if (req.user.branch !== req.body.branch)
      throw new Error("Branch # not matched!");
    next();
  } catch (error) {
    return createError(res, 401, error.message);
  }
};

module.exports = {
  VerifyUserCookie,
  VerifyAdmin,
  VerifyBranch,
  VerifyBranchId,
};
