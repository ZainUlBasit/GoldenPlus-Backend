const moment = require("moment/moment");
const Joi = require("joi");
const { createError, successMessage } = require("../utils/ResponseMessage");
const { isValidObjectId } = require("mongoose");
const Payment = require("../Models/Payment");
const Customer = require("../Models/Customer");
const Company = require("../Models/Company");

const addPayment = async (req, res, next) => {
  const {
    user_type,
    user_Id,
    user_name,
    depositor,
    payment_type,
    bank_name,
    bank_number,
    amount,
    date,
    desc,
    branch,
  } = req.body;

  const reqStr = Joi.string().required();
  const reqNum = Joi.number().required();

  const paymentSchema = Joi.object({
    user_type: Joi.number().valid(1, 2).required(),
    user_Id: reqStr,
    user_name: reqStr,
    depositor: reqStr,
    payment_type: Joi.number().valid(1, 2).required(),
    bank_name: reqStr.allow(null), // Allow null for Cash payments
    bank_number: reqNum.allow(null), // Allow null for Cash payments
    amount: reqNum,
    date: reqNum.default(() => Math.floor(Date.now() / 1000)),
    desc: reqStr,
    branch: reqNum,
  });

  const { error } = paymentSchema.validate(req.body.values);
  if (error) {
    return createError(res, 422, error.message);
  }

  try {
    if (user_type === 2 || user_type === "2") {
      const updateCustomerAccount = await Customer.findByIdAndUpdate(
        user_Id,
        { $inc: { paid: amount, remaining: amount * -1 } }, // Decrement qty field by decrementQty
        { new: true }
      );

      if (!updateCustomerAccount)
        return createError(res, 400, "Unable to update customer accounts!");
    } else if (user_type === 1 || user_type === "1") {
      const updateValue = {
        $inc: { paid: amount, remaining: amount * -1 },
      };
      const updatedCompany = await Company.findByIdAndUpdate(
        user_Id,
        updateValue,
        { new: true }
      );
      if (!updatedCompany)
        return createError(res, 400, "Unable to update company accounts!");
    }

    const newPayment = await new Payment({
      user_type,
      user_Id,
      user_name,
      depositor,
      payment_type,
      bank_name,
      bank_number,
      amount,
      date: Math.floor(new Date(date) / 1000),
      desc,
      branch,
    }).save();

    if (!newPayment) return createError(res, 400, "Unable to add new Payment!");
    else return successMessage(res, newPayment, "Payment Successfully Added!");
  } catch (err) {
    return createError(res, 500, err.message || "Internal Server Error!");
  }
};

const getAllPayments = async (req, res, next) => {
  try {
    const allPayments = await Payment.find();
    if (!allPayments) {
      return createError(res, 404, "Payments record not found!");
    }
    return successMessage(res, allPayments, null);
  } catch (err) {
    console.log(err);
    return createError(res, 500, err.message || err);
  }
};

const getBranchPayments = async (req, res, next) => {
  const {
    branch,
    user_Id,
    startDate = 0,
    endDate = Math.floor(Date.now() / 1000),
  } = req.body;

  console.log(req.body);

  let branchPayments;
  try {
    const Payload =
      branch === -1
        ? {
            user_Id,
            date: {
              $gte: Math.floor(new Date(startDate) / 1000),
              $lte: Math.floor(new Date(endDate) / 1000),
            },
          }
        : {
            user_Id,
            branch,
            date: {
              $gte: Math.floor(new Date(startDate) / 1000),
              $lte: Math.floor(new Date(endDate) / 1000),
            },
          };

    branchPayments = await Payment.find(Payload);
    // console.log(branchPayments);

    if (!branchPayments) {
      return createError(res, 404, "Payments record not found for branch!");
    } else {
      return successMessage(res, branchPayments, null);
    }
  } catch (err) {
    console.log(err);
    return createError(res, 500, err.message || err);
  }
};

const deletePayment = async (req, res, next) => {
  const { paymentInfo } = req.body;
  if (!paymentInfo._id) {
    return createError(res, 422, "Required fields are undefined!");
  }

  try {
    const deletedPayment = await Payment.findByIdAndDelete(paymentInfo._id);
    if (!deletedPayment) {
      return createError(res, 400, "Payment with such id does not exist!");
    }

    if (paymentInfo.user_type === 2 || paymentInfo.user_type === "2") {
      const updateCustomerAccount = await Customer.findByIdAndUpdate(
        paymentInfo.user_Id,
        {
          $inc: {
            paid: -paymentInfo.amount,
            remaining: paymentInfo.amount,
          },
        }, // Decrement qty field by decrementQty
        { new: true }
      );

      if (!updateCustomerAccount)
        return createError(res, 400, "Unable to update customer accounts!");
    } else if (paymentInfo.user_type === 1 || paymentInfo.user_type === "1") {
      const updateValue = {
        $inc: {
          paid: -paymentInfo.amount,
          remaining: paymentInfo.amount,
        },
      };
      const updatedCompany = await Company.findByIdAndUpdate(
        paymentInfo.user_Id,
        updateValue,
        { new: true }
      );
      if (!updatedCompany)
        return createError(res, 400, "Unable to update company accounts!");
    }

    return successMessage(
      res,
      deletedPayment,
      `Payment ${deletedPayment._id} is successfully deleted!`
    );
  } catch (error) {
    return createError(res, 500, error.message || error);
  }
};

const updatePayment = async (req, res, next) => {
  const { paymentInfo, payload } = req.body;

  // console.log(req.body);

  if (!paymentInfo || !payload) {
    return createError(res, 422, "Required field are undefined!");
  }

  let payment;
  try {
    payment = await Payment.findByIdAndUpdate(paymentInfo._id, payload, {
      new: true,
    });
    if (!payment) {
      return createError(res, 404, "Payment with such id was not found!");
    }
    if (paymentInfo.user_type === 2 || paymentInfo.user_type === "2") {
      const updateCustomerAccount = await Customer.findByIdAndUpdate(
        paymentInfo.user_Id,
        {
          $inc: {
            paid: -paymentInfo.amount + payload.amount,
            remaining: paymentInfo.amount - payload.amount,
          },
        }, // Decrement qty field by decrementQty
        { new: true }
      );

      if (!updateCustomerAccount)
        return createError(res, 400, "Unable to update customer accounts!");
    } else if (paymentInfo.user_type === 1 || paymentInfo.user_type === "1") {
      const updateValue = {
        $inc: {
          paid: -paymentInfo.amount + payload.amount,
          remaining: -paymentInfo.amount + payload.amount,
        },
      };
      const updatedCompany = await Company.findByIdAndUpdate(
        paymentInfo.user_Id,
        updateValue,
        { new: true }
      );
      if (!updatedCompany)
        return createError(res, 400, "Unable to update company accounts!");
    }
    return successMessage(res, payment, "Payment Successfully Updated!");
  } catch (err) {
    console.log("error: ", err);
    return createError(res, 500, err.message || err);
  }
};

module.exports = {
  addPayment,
  getAllPayments,
  getBranchPayments,
  deletePayment,
  updatePayment,
};
