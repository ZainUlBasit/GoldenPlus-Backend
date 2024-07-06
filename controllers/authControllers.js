const Joi = require("joi");
const bcrypt = require("bcrypt");
const User = require("../Models/User");
const userDto = require("../Services/userDto");
const JwtService = require("../Services/JwtServices");
const jwt = require("jsonwebtoken");
const RefreshModel = require("../Models/RefreshToken");
const { createError, successMessage } = require("../utils/ResponseMessage");
const { isValidObjectId } = require("mongoose");
const RefreshToken = require("../Models/RefreshToken");
const privateKey = process.env.ACCESS_SECRET_KEY;

function authControllers() {
  return {
    login: async (req, res) => {
      // validate the req
      const loginSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      });

      const { error } = loginSchema.validate(req.body);
      if (error) return createError(res, 422, error.message);

      // check useremail
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return createError(res, 422, "No such email registered!");

      // check user password using bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return createError(res, 403, "email or password doesn't match!");
      let populatedUser = user;
      if (user.role === 2) {
        populatedUser = await user.populate("branchId");
      }
      const jwtBody =
        user.role === 1
          ? {
              _id: user._id,
              role: user.role,
            }
          : user.role === 2 && {
              _id: user._id,
              role: user.role,
              branch: user.branchId.branch_number,
            };
      // const { accessToken, refreshToken } = JwtService.generateToken(jwtBody);

      var token = await jwt.sign({ ...jwtBody }, privateKey);

      res.cookie("userToken", token, {
        // maxAge: 60000000,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      // const result = await JwtService.storeRefreshToken(refreshToken, user._id);
      // if (!result)
      //   return createError(
      //     res,
      //     500,
      //     "Internal server error.Cannot store refresh token"
      //   );

      // store  access token and refresh token in cookies
      // res.cookie("refreshtoken", refreshToken, {
      //   maxAge: 1000 * 60 * 60 * 24 * 30, //2 hour
      //   httpOnly: true,
      // });

      // res.cookie("accesstoken", accessToken, {
      //   maxAge: 1000 * 60 * 60, // 1 hour
      //   httpOnly: true,
      // });

      delete user.password;

      // const userdata = userDto(user);
      return successMessage(
        res,
        { user: user.role === 2 ? populatedUser : user, token: token },
        "Successfully Logged In!"
      );
    },
    register: async (req, res) => {
      const {
        name,
        email,
        password,
        confirmPassword,
        role,
        branch_number,
        imageUrl,
      } = req.body;
      // validate req using joi
      const registerSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string()
          .pattern(new RegExp("^[a-zA-Z0-9]{5,15}$"))
          .required()
          .min(8)
          .max(15)
          .messages({
            "string.pattern.base":
              "Password must include alphabets and numbers",
            "string.min": "Password must be minimum 8 character required",
            "string.max": "Password must be upto 15 characters ",
          }),
        confirmPassword: Joi.ref("password"),
        role: Joi.number().valid(1, 2, 3).required(),
        branch_number: Joi.number().valid(1, 2, 3),
        imageUrl: Joi.string(),
      });
      const { error } = registerSchema.validate(req.body);
      if (error) return createError(res, 422, error.message);
      // if role is branch(2) then check the branch #
      else if (req.body.role === 2 && !req.body.branch_number) {
        return createError(res, 422, "Branch # is required for Role Branch");
      }
      // if role is branch(2) then check the branch # exist or not
      else if (req.body.role === 2 && req.body.branch_number) {
        const user = await User.exists({ branch_number });
        if (user) return createError(res, 409, "Branch # already registered");
      }

      // check if email has not register yet
      const user = await User.exists({ email });
      if (user) return createError(res, 409, "Email already registered");
      if (password !== confirmPassword)
        return createError(res, 422, "Password not matching");

      let newUser;
      try {
        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const payload =
          role === 2 || role === 3
            ? {
                name,
                email,
                password: hashedPassword,
                role,
                branch_number,
                imageUrl,
              }
            : role === 1 && { name, email, password: hashedPassword, role };
        // register user
        newUser = new User(payload);
        const isSaved = await newUser.save();
        if (!isSaved)
          return createError(
            res,
            500,
            "Internal server error.Could not register user"
          );
        return successMessage(res, newUser, `${name} successfully registered!`);
      } catch (err) {
        return createError(res, 500, err.message || err);
      }
    },
    branches: async (req, res) => {
      try {
        const branches = await User.find({ role: 2 });
        if (!branches) return createError(res, 404, "Branches not found!");
        else return successMessage(res, branches, null);
      } catch (err) {
        return createError(res, 400, err.message);
      }
    },
    deleteBranch: async (req, res) => {
      const id = req.params.id;
      console.log(id);
      if (!id) return createError(res, 422, "Invalid Branch Id!");
      try {
        const branch = await User.findByIdAndDelete(id);
        if (!branch) return createError(res, 404, "Branch not Found!");
        else
          return successMessage(
            res,
            200,
            `${branch.name} successfully deleted!`
          );
      } catch (err) {
        return createError(res, 400, err.message);
      }
    },
    updateBranch: async (req, res) => {
      const { branchId, payload } = req.body;
      console.log(req.body);
      if (!branchId) return createError(res, 422, "Invalid Branch Id!");
      if (!payload) return createError(res, 422, "Invalid Payload!");
      let hashedPassword;

      if (payload.password)
        hashedPassword = await bcrypt.hash(payload.password, 10);

      payload.password = hashedPassword;

      try {
        const branch = await User.findByIdAndUpdate(branchId, payload);
        if (!branch) return createError(res, 404, "Branch not Found!");
        else
          return successMessage(
            res,
            200,
            `${branch.name} successfully updated!`
          );
      } catch (err) {
        return createError(res, 400, err.message);
      }
    },
    logout: async (req, res) => {
      console.log(req.user._id);
      try {
        const token = await RefreshModel.findOneAndRemove({
          userId: req.user._id,
        });
        if (!token) {
          return res.status(422).json({ message: "Token not found" });
        }
        res.clearCookie("accesstoken");
        res.clearCookie("refreshtoken");
      } catch (err) {
        return createError(res, 500, err.message || err);
      }
      return successMessage(res, null, "Logout successfully");
    },
    autoLogin: async (req, res) => {
      const { refreshtoken: refreshTokenFromCookies } = req.cookies;
      if (!refreshTokenFromCookies) {
        return createError(res, 401, "Token not found");
      }
      let userData;
      try {
        userData = await JwtService.verifyRefreshToken(refreshTokenFromCookies);
      } catch (error) {
        return createError(res, 401, error.message);
      }

      console.log("userData: ", userData);

      try {
        const token = await JwtService.findRefreshToken(
          userData._id,
          refreshTokenFromCookies
        );
        console.log(token);
        if (!token) {
          return createError(res, 401, "Invalid Token!");
        }
      } catch (error) {
        return createError(res, 401, error.message);
      }

      const userExist = await User.findById(userData._id);
      if (!userExist) {
        return createError(res, 404, "Invalid User!");
      }
      const { accessToken, refreshToken } = JwtService.generateToken({
        _id: userData._id,
        role: userData.role,
        branch: userData.branch_number,
      });
      try {
        const result = await JwtService.updateRefreshToken(
          userData._id,
          refreshToken
        );
      } catch (error) {
        return createError(res, 500, error.message);
      }

      // store  access token and refresh token in cookies
      res.cookie("refreshtoken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30, //2 hour
        httpOnly: true,
      });

      res.cookie("accesstoken", accessToken, {
        maxAge: 1000 * 60 * 60, // 1 hour
        httpOnly: true,
      });
      const userdata = userDto(userExist);
      delete userExist.password;
      return successMessage(res, userExist, null);
    },
  };
}

module.exports = authControllers;
