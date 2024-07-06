// const Joi = require("joi");
const bcrypt = require("bcrypt");
const Customer = require("../Models/Customer");
const CusUserDto = require("../Services/CusUserDto");
const JwtService = require("../Services/JwtServices");

function CusAuthControllers() {
  return {
    login: async (req, res) => {
      console.log(req.body);
      // check useremail
      const { email, password } = req.body;
      const customer = await Customer.findOne({ email });
      if (!customer) {
        return res.status(422).json({ message: "Email or password incorrect" });
      }

      // check user password using bcrypt
      const isMatch = await bcrypt.compare(password, customer.password);
      if (!isMatch) {
        return res.status(403).json({ message: "Email or password incorrect" });
      }
      const { accessToken, refreshToken } = JwtService.generateToken({
        _id: customer._id,
      });

      return res.json(CusUserDto(customer));
    },
    register: async (req, res) => {
      // validate req using joi
      const registerSchema = Joi.object({
        fullname: Joi.string().required(),
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
        cnic: Joi.string().required(),
        contact: Joi.string().required(),
        address: Joi.string().required(),
        shop: Joi.string().required(),
      });
      const { error } = registerSchema.validate(req.body.values);
      if (error) {
        return res.status(422).json({ message: error.message });
      }
      // check if email has not register yet
      const {
        fullname,
        email,
        confirmPassword,
        password,
        contact,
        cnic,
        address,
        shop,
        ref,
        page,
      } = req.body;
      const customer = await Customer.exists({ email });
      if (customer) {
        return res.status(409).json({ message: "Email already registered" });
      }
      if (
        !fullname ||
        !email ||
        !password ||
        !cnic ||
        !password ||
        !confirmPassword ||
        !contact ||
        !address ||
        !shop
      ) {
        return res.status(422).json({ message: "All fields are required" });
      }
      if (password !== confirmPassword) {
        return res.status(422).json({ message: "Password not matching" });
      }

      try {
        // hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        // register user
        const newCustomer = new Customer({
          fullname,
          email,
          password: hashedPassword,
          contact,
          cnic,
          address,
          shop,
          ref,
          page,
          discount: 0,
          paid: 0,
          remaining: 0,
          total: 0,
        });

        const isSaved = await newCustomer.save();
        if (!isSaved) {
          return res
            .status(500)
            .json({ message: "Internal server error.Could not register user" });
        }
        return res.json(CusUserDto(newCustomer));
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Internal server error.Please try again" });
      }

      // return res.json({ message: "All ok" });
    },
  };
}

module.exports = CusAuthControllers;
