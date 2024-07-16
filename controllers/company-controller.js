const Joi = require("joi");
const Company = require("../Models/Company");
const { createError, successMessage } = require("../utils/ResponseMessage");

const getAllCompanies = async (req, res, next) => {
  let companies;
  try {
    companies = await Company.find();
  } catch (err) {
    console.log(err);
    return createError(res, 400, "Internal Server Error. Please Try Again!");
  }
  if (!companies) {
    return createError(res, 404, "Companies record not found!");
  }
  return successMessage(res, companies, null);
};
const getBranchCompanies = async (req, res, next) => {
  const { branch } = req.body;
  console.log(req.body);

  const companySchema = Joi.object({
    branch: Joi.number().required(),
  });

  const { error } = companySchema.validate(req.body);
  if (error) return createError(res, 422, error.message);

  let companies;
  try {
    if (branch < 0) companies = await Company.find();
    else companies = await Company.find({ branch });
  } catch (err) {
    console.log(err);
    return createError(res, 400, err.message);
  }
  if (!companies) {
    return createError(res, 404, "Companies record not found!");
  }
  return successMessage(res, companies, null);
};

const CreateCompany = async (req, res) => {
  let company;
  const { name, email, contact, cnic, description, address, branch } = req.body;
  console.log(req.user);

  const companySchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    contact: Joi.string().required(),
    cnic: Joi.string().required(),
    description: Joi.string().required(),
    address: Joi.string().required(),
    branch: Joi.number().required(),
  });

  const { error } = companySchema.validate(req.body);
  if (error) {
    return createError(res, 422, error.message);
  }

  try {
    const checkCompany = await Company.exists({ email });
    if (checkCompany) return createError(res, 409, "Email already registered");

    company = await new Company({
      name,
      email,
      contact,
      cnic,
      description,
      address,
      branch,
    }).save();
  } catch (err) {
    console.log(err);
    return createError(res, 400, "Internal Server Error. Please Try Again!");
  }
  if (!company) {
    return createError(res, 400, "Unable to Add Company!");
  }
  return successMessage(res, company, "Company Successfully Added!");
};

const updateCompany = async (req, res, next) => {
  const { companyId, payload, branch } = req.body;
  console.log(req.body);

  // check the payload
  const reqStr = Joi.string().required();

  // Corrected Joi email validation
  const reqNum = Joi.number().required();

  const isValidEmail = (email) => {
    // Basic email validation, you can replace it with a more robust solution
    return /\S+@\S+\.\S+/.test(email);
  };

  if (typeof payload !== "object" || payload === null) {
    return createError(res, 422, "Payload must be an object.");
  }
  if (typeof payload.name !== "string" || payload.name.trim() === "") {
    return createError(
      res,
      422,
      "Name is required and must be a non-empty string."
    );
  }
  if (typeof payload.email !== "string" || payload.email.trim() === "") {
    return createError(
      res,
      422,
      "Email is required and must be a valid email address."
    );
  }
  if (typeof payload.contact !== "string" || payload.contact.trim() === "") {
    return createError(
      res,
      422,
      "Contact is required and must be a non-empty string."
    );
  }
  if (typeof payload.cnic !== "string" || payload.cnic.trim() === "") {
    return createError(
      res,
      422,
      "CNIC is required and must be a non-empty string."
    );
  }
  if (
    typeof payload.description !== "string" ||
    payload.description.trim() === ""
  ) {
    return createError(
      res,
      422,
      "Description is required and must be a non-empty string."
    );
  }
  if (typeof payload.address !== "string" || payload.address.trim() === "") {
    return createError(
      res,
      422,
      "Address is required and must be a non-empty string."
    );
  }

  const CompanyUpdateSchema = Joi.object({
    companyId: reqStr,
    branch: reqNum,
    payload: Joi.object().required(),
  });

  // check if the validation returns error
  const { error } = CompanyUpdateSchema.validate(req.body);
  if (error) {
    return createError(res, 422, error.message);
  }

  try {
    const company = await Company.findOneAndUpdate(
      { _id: companyId, branch },
      { $set: payload },
      { new: true } // Return the updated document
    );
    if (!company)
      return createError(res, 404, "Company with such id was not found!");
    else return successMessage(res, company, "Company Successfully Updated!");
  } catch (err) {
    return createError(res, 500, err.message || err);
  }
};

const deleteCompany = async (req, res, next) => {
  const { id: companyId } = req.params;
  if (!companyId) return createError(res, 422, "Invalid Company Id!");
  try {
    const delCompany = await Company.findOneAndDelete({ _id: companyId });
    if (!delCompany)
      return createError(
        res,
        400,
        "Such Company with companyId does not exist!"
      );
    return successMessage(
      res,
      delCompany,
      `Company ${delCompany.name} is successfully deleted!`
    );
  } catch (error) {
    return createError(res, 500, error.message || error);
  }
};

// all done crud operation

const updateCompanyTotal = async (req, res, next) => {
  const companyid = req.params.id;
  const { total } = req.body;
  let companyy;
  try {
    const filter = { _id: companyid };
    const update = { $inc: { total: ctotal, remaining: ctotal } };
    companyy = await Company.updateOne(
      filter,
      update,
      { new: true },
      (err, data) => {
        if (data === null) {
          return res.status(404).json({ message: "Item not found" });
        } else {
          return res.status(200).json({ companyy });
        }
      }
    );
  } catch (err) {
    console.log(err.message);
  }
};

const updateCompanyPayment = async (req, res, next) => {
  const companyName = req.params.id;
  const companyShop = req.params.id1;
  const { curTotal } = req.body;
  let companyy;
  try {
    const newRem = Number(curTotal) * -1;
    const filter = { _id: companyName, shop: companyShop };
    const update = { $inc: { remaining: newRem, paid: curTotal } };
    companyy = await Company.updateOne(
      filter,
      update,
      { new: true },
      (err, data) => {
        if (data === null) {
          return res.status(404).json({ message: "Item not found" });
        } else {
          return res.status(200).json({ companyy });
        }
      }
    );
  } catch (err) {
    console.log(err.message);
  }
};

const addCompanyPayment = async (req, res, next) => {
  let companyPayment;
  const { companyid, name, cash, accountno, date, description, shop } =
    req.body;
  try {
    companyPayment = new CompanyPayment({
      companyid,
      name,
      cash,
      accountno,
      date,
      description,
      shop,
    });
    await companyPayment.save();
  } catch (err) {
    console.log(err);
  }

  if (!companyPayment) {
    return res.status(500).json({ message: "Unable to Add Company" });
  }
  return res.status(201).json({ companyPayment });
};

const getCompanyPayment = async (req, res, next) => {
  const { cid, sname, fromdate, todate } = req.body;
  const startDate = new Date(fromdate);
  const endDate = new Date(todate);
  let companyPayment;
  try {
    companyPayment = await CompanyPayment.find({
      companyid: cid,
      shop: sname,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });
  } catch (err) {
    console.log(err);
  }

  if (!companyPayment) {
    return res.status(500).json({ message: "Unable to Add Company" });
  }
  return res.status(201).json(companyPayment);
};

const UpdateCompanyOpeningBalance = async (req, res, next) => {
  const { companyId, newBalance } = req.body;
  console.log(req.body);

  if (!companyId || !newBalance)
    return createError(res, 422, "Required fields are undefined!");
  try {
    let company = await Company.findByIdAndUpdate(
      companyId,
      {
        $inc: {
          total: Number(newBalance),
          remaining: Number(newBalance),
          opening_balance: Number(newBalance),
        },
      }, // Decrement qty field by decrementQty
      { new: true }
    );
    if (company)
      return successMessage(
        res,
        company,
        "Opening Balance Successfully Updated!"
      );
    else
      return createError(res, 400, "Unable to update Company Opening Balance");
  } catch (err) {
    console.log(err);
    return createError(res, 500, err.message || err);
  }
};

module.exports = {
  getAllCompanies,
  getBranchCompanies,
  CreateCompany,
  updateCompany,
  deleteCompany,
  updateCompanyTotal,
  addCompanyPayment,
  getCompanyPayment,
  updateCompanyPayment,
  UpdateCompanyOpeningBalance,
};
