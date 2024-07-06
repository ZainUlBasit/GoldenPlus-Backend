const Joi = require("joi");
const { createError, successMessage } = require("../utils/ResponseMessage");
const Product = require("../Models/Product");
const Item = require("../Models/Item");
const Customer = require("../Models/Customer");
const Return = require("../Models/Return");

const CreateTransaction = async (req, res, next) => {
  // console.log("Return...........", req.body);
  const {
    customerId,
    date = Math.floor(Date.now() / 1000),
    items,
    invoice_no,
  } = req.body;

  if (!customerId || !date)
    return createError(res, 422, "Required fields are undefined!");

  if (!Array.isArray(items))
    return createError(res, 422, "Items must be an array of objects!");

  try {
    const productIds = await Promise.all(
      items.map(async (item) => {
        const {
          itemId,
          article_name,
          article_size,
          qty,
          price,
          purchase,
          amount,
        } = item;
        const savedProduct = await new Product({
          itemId,
          qty,
          price,
          article_name,
          article_size,
          purchase,
          amount,
        }).save();

        // Update the item and collect the response
        const response = await Item.findByIdAndUpdate(
          itemId,
          { $inc: { qty: qty, out_qty: -qty } }, // Decrement qty field by qty
          { new: true } // Return the updated document
        );

        return savedProduct._id;
      })
    );

    const totalAmount = items.reduce((acc, item) => acc + item.amount, 0);

    const return_items = await new Return({
      customerId,
      date: Math.floor(new Date(date) / 1000),
      items: productIds,
      total_amount: totalAmount,
      invoice_no,
    }).save();

    if (!return_items) return createError(res, 400, "Unable to Return Items!");
    const updateCustomerAccount = await Customer.findByIdAndUpdate(
      customerId,
      { $inc: { return_amount: totalAmount, remaining: -totalAmount } }, // Decrement qty field by decrementQty
      { new: true }
    );
    return successMessage(res, return_items, "Return Successfully Added!");
  } catch (err) {
    console.log("Error Occur While Return: ", err);
    return createError(res, 500, err.message || err);
  }
};

const GetReturns = async (req, res) => {
  try {
    const { customerId } = req.body;
    // console.log(req.body);

    if (!customerId) {
      return createError(res, 422, "Customer ID is required!");
    }

    // Convert dates to seconds (if they're not already)
    const transactions = await Return.find({
      customerId,
    })
      .populate("customerId")
      .populate({
        path: "items",
        populate: { path: "itemId" }, // Populate the itemId field inside the items array
      });

    const UpdatedTransactions = transactions
      .map((data) => {
        const itemsData = data.items.map((dt) => {
          return {
            date: data.date,
            invoice_no: data.invoice_no,
            name: dt.itemId.name,
            qty: dt.qty,
            purchase: dt.purchase,
            price: dt.price,
            amount: dt.amount,
          };
        });
        return itemsData;
      })
      .flat();

    return successMessage(
      res,
      UpdatedTransactions,
      "Returns retrieved successfully!"
    );
  } catch (err) {
    console.error("Error occurred while fetching returns data:", err);
    return createError(res, 500, err.message || "Internal Server Error");
  }
};

const DeleteInvoice = async (req, res) => {
  const { customerId, invoice_no: current_invoice_no } = req.body;

  try {
    const transactions = await Return.find({
      customerId,
      invoice_no: current_invoice_no,
    })
      .populate("customerId")
      .populate("items");

    const UpdatedTransactions = transactions
      .map((data) => {
        const itemsData = data.items.map((dt) => {
          return {
            date: data.date,
            invoice_no: data.invoice_no,
            qty: dt.qty,
            purchase: dt.purchase,
            price: dt.price,
            amount: dt.amount,
            itemId: dt.itemId,
          };
        });
        return itemsData;
      })
      .flat();

    const totalAmount = transactions.reduce((total, cust) => {
      return total + Number(cust.total_amount);
    }, 0);
    const totalDiscount = transactions.reduce((total, cust) => {
      return total + Number(cust.discount);
    }, 0);

    await Promise.all(
      UpdatedTransactions.map(async (item) => {
        const { itemId, qty } = item;
        const response = await Item.findByIdAndUpdate(
          itemId,
          { $inc: { qty: -qty, out_qty: qty } }, // Decrement qty field by decrementQty
          { new: true } // Return the updated document
        );
      })
    );

    const updateCustomerAccount = await Customer.findByIdAndUpdate(
      customerId,
      {
        $inc: {
          remaining: Number(totalAmount),
          return_amount: -Number(totalAmount),
        },
      }, // Decrement qty field by decrementQty
      { new: true }
    );

    const deleteTransaction = await Return.deleteOne({
      invoice_no: current_invoice_no,
    });

    if (!deleteTransaction)
      return createError(
        res,
        400,
        "Unable to delete invoice no " + current_invoice_no
      );
    else
      return successMessage(
        res,
        200,
        "Invoice no" + current_invoice_no + " successfully deleted!"
      );
  } catch (error) {
    return createError(res, 400, error.message || "Internal server error!");
  }
};

module.exports = {
  CreateTransaction,
  GetReturns,
  DeleteInvoice,
};
