const bcrypt = require("bcrypt");
const CusDto = require("../Services/CustomerDTO");
const Joi = require("joi");
const { createError, successMessage } = require("../utils/ResponseMessage");
const Customer = require("../Models/Customer");
const { isValidObjectId } = require("mongoose");
const User = require("../Models/User");
const Transaction = require("../Models/Transaction");
const Return = require("../Models/Return");

//******************************************************
// working
//******************************************************
const getAllCustomers = async (req, res, next) => {
  let customers;
  try {
    customers = await Customer.find();
    if (!customers) return createError(res, 404, "No Item Found");
    return successMessage(res, customers, null);
  } catch (err) {
    console.log(err);
    return createError(res, 500, err.message || err);
  }
};

const getBranchCustomers = async (req, res, next) => {
  const { branch } = req.body;
  // console.log(req.body);

  const CustomerSchema = Joi.object({
    branch: Joi.number().required(),
  });

  const { error } = CustomerSchema.validate(req.body.values);
  if (error) return createError(res, 422, error.message);

  let customers;
  try {
    if (branch < 0) customers = await Customer.find();
    else customers = await Customer.find({ branch: branch });
    // console.log("customers:", customers);
    if (!customers) return createError(res, 404, "No Item Found");
    return successMessage(res, customers, null);
  } catch (err) {
    console.log(err);
    return createError(res, 500, err.message || err);
  }
};

const UpdateCustomer = async (req, res, next) => {
  const { customerId, payload } = req.body;
  const reqStr = Joi.string().required();
  const reqNum = Joi.number().required();

  if (!customerId || !payload)
    return createError(res, 422, "Required fields are undefined!");
  try {
    let customer = await Customer.findById(customerId);
    if (!customer)
      return createError(res, 404, "Customer with such id was not found!");
    // Update item properties
    Object.assign(customer, payload);
    // Save the updated item
    await customer.save();
    return successMessage(res, customer, "Customer Successfully Updated!");
  } catch (err) {
    console.log(err);
    return createError(res, 500, err.message || err);
  }
};
const deleteCustomer = async (req, res, next) => {
  const { id: customerId } = req.params;
  console.log(customerId);

  if (!customerId)
    return createError(res, 422, "Required fields are undefined!");

  try {
    const DeleteCustomer = await Customer.findByIdAndDelete(customerId);
    if (!DeleteCustomer)
      return createError(
        res,
        400,
        "Such Customer with customerId does not exist!"
      );
    else
      return successMessage(
        res,
        DeleteCustomer,
        `Item ${DeleteCustomer.name} is successfully deleted!`
      );
  } catch (err) {
    return createError(res, 500, err.message || err);
  }
};
//******************************************************
// working
//******************************************************
const CheckCustomers = async (req, res, next) => {
  const { email, password } = req.body;
  let customers;
  try {
    customers = await Customer.findOne({ email });
    // check email
    if (!customers) {
      return res.status(422).json({ message: "Email or password incorrect" });
    }
    // check password
    const isMatch = await bcrypt.compare(password, customers.password);
    if (!isMatch) {
      return res.status(403).json({ message: "Email or password incorrect" });
    }
    const cusData = CusDto(customers);
    // send data to frontend if available
    return res.status(201).json(cusData);
  } catch (err) {
    console.log(err);
  }

  if (!customers) {
    return res.status(404).json({ message: "No Item Found" });
  }
  return res.status(200).json(customers);
};
//******************************************************
// working
//******************************************************
const addCustomer = async (req, res, next) => {
  let customer;
  console.log(req.body);
  const {
    name,
    email,
    contact,
    cnic,
    address,
    branch,
    ref,
    page,
    type,
    password,
  } = req.body;

  // schema validation
  const reqStr = Joi.string().required();
  const reqNum = Joi.number().required();
  const defNum = Joi.number().default(0);

  const customerSchema = Joi.object({
    name: reqStr,
    email: reqStr,
    cnic: reqStr,
    contact: reqStr,
    password: reqStr,
    type: reqNum,
    address: reqStr,
    branch: reqNum,
    ref: reqStr,
    page: reqNum,
  });

  const { error } = customerSchema.validate(req.body.values);
  if (error) return createError(res, 422, error.message);

  customer = await Customer.exists({ email });
  if (customer) {
    return createError(res, 409, "Email already registered!");
  }

  try {
    customer = await new Customer({
      name,
      email,
      contact,
      cnic,
      address,
      branch,
      ref,
      page,
      user_type: type,
      password,
    }).save();

    if (!customer) return createError(res, 400, "Unable to Add Customer!");
    // changes

    const hashedPassword = await bcrypt.hash(password, 10);
    const payload = {
      name,
      email,
      password: hashedPassword,
      role: 3,
      branch_number: branch,
    };
    // register user
    newUser = new User(payload);
    const isSaved = await newUser.save();
    if (!isSaved)
      return createError(
        res,
        500,
        "Internal server error.Could not register user"
      );

    return successMessage(res, customer, "Customer Successfully Added!");
  } catch (err) {
    console.log(err);
    return createError(res, 500, err.message || err);
  }
};

const Get_Bill_No = async (req, res) => {
  const { id: customerId } = req.params;
  try {
    if (!customerId) {
      return createError(res, 422, "Customer ID is required!");
    }
    const transactions = await Transaction.find({ customerId });

    const UpdatedTransactions = transactions
      .map((data) => {
        const itemsData = data.items.map((dt) => {
          return {
            invoice_no: data.invoice_no,
            type: 1,
          };
        });
        return itemsData;
      })
      .flat();

    const returns = await Return.find({
      customerId,
    });

    const UpdatedReturns = returns
      .map((data) => {
        const itemsData = data.items.map((dt) => {
          return {
            invoice_no: data.invoice_no,
            type: 2,
          };
        });
        return itemsData;
      })
      .flat();

    const Trans_Data = [...UpdatedTransactions, ...UpdatedReturns];
    // Remove duplicates based on invoice_no
    const uniqueTrans_Data = Trans_Data.reduce((acc, current) => {
      const x = acc.find((item) => item.invoice_no === current.invoice_no);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    return successMessage(
      res,
      uniqueTrans_Data,
      "Transactions retrieved successfully!"
    );
  } catch (err) {
    console.error("Error occurred while fetching transactions:", err);
    return createError(res, 500, err.message || "Internal Server Error");
  }
};

module.exports = {
  Get_Bill_No,
  getBranchCustomers,
  getAllCustomers,
  UpdateCustomer,
  deleteCustomer,
  addCustomer,
  CheckCustomers,
};
