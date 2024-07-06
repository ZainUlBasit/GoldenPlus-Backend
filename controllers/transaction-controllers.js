const Joi = require("joi");
const { createError, successMessage } = require("../utils/ResponseMessage");
const Transaction = require("../Models/Transaction");
const Product = require("../Models/Product");
const Item = require("../Models/Item");
const Customer = require("../Models/Customer");
const Return = require("../Models/Return");

const CheckBillNumber = async (req, res, next) => {
  const { invoice_no } = req.body;
  try {
    // Retrieve transactions for the given invoice number
    const transactions = await Transaction.find({ invoice_no });
    const returns = await Return.find({ invoice_no });

    if (transactions.length > 0 || returns.length > 0) {
      // If transactions exist with the given invoice number, return true
      return successMessage(
        res,
        { exists: true },
        "Invoice number already exists."
      );
    } else {
      // If no transactions are found with the given invoice number, return false
      return successMessage(
        res,
        { exists: false },
        "Invoice number is available."
      );
    }
  } catch (err) {
    console.error("Error occurred while checking invoice number:", err);
    return createError(res, 500, err.message || "Internal Server Error");
  }
};

const CreateTransaction = async (req, res, next) => {
  console.log(req.body);
  const {
    customerId,
    date = Math.floor(Date.now() / 1000),
    items,
    discount,
    invoice_no,
  } = req.body;

  if (
    !customerId ||
    !date ||
    discount === "" ||
    invoice_no === "" ||
    Number(invoice_no) < 0
  )
    return createError(res, 422, "Required fields are undefined!");

  if (!Array.isArray(items))
    return createError(res, 422, "Items must be an array of objects!");

  try {
    const productIds = await Promise.all(
      items.map(async (item) => {
        // article_name: reqStr,
        // article_size: reqNum,
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
        return savedProduct._id;
      })
    );
    let totalAmount = 0;
    await Promise.all(
      items.map(async (item) => {
        const { itemId, qty, amount } = item;
        const response = await Item.findByIdAndUpdate(
          itemId,
          { $inc: { qty: -qty, out_qty: qty } }, // Decrement qty field by decrementQty
          { new: true } // Return the updated document
        );
        totalAmount += amount;
      })
    );

    const transaction = await new Transaction({
      customerId,
      date: Math.floor(new Date(date) / 1000),
      discount,
      items: productIds,
      total_amount: totalAmount,
      invoice_no,
    }).save();

    if (!transaction)
      return createError(res, 400, "Unable to Add Transaction!");
    const updateCustomerAccount = await Customer.findByIdAndUpdate(
      customerId,
      {
        $inc: {
          total: totalAmount,
          remaining: Number(totalAmount) - Number(discount),
          discount: discount,
        },
      }, // Decrement qty field by decrementQty
      { new: true }
    );
    return successMessage(res, transaction, "Transaction Successfully Added!");
  } catch (err) {
    console.log("Error Occur While Transaction: ", err);
    return createError(res, 500, err.message || err);
  }
};

const GetTransactions = async (req, res) => {
  const { from, to, customerId } = req.body;
  console.log(req.body);

  // return successMessage(res, transactions, "");
  try {
    console.log(req.body);

    if (!customerId) {
      return createError(res, 422, "Customer ID is required!");
    }

    // Convert dates to seconds (if they're not already)
    const fromDateInSeconds = Math.floor(new Date(from) / 1000);
    const toDateInSeconds = Math.floor(new Date(to) / 1000);

    // Retrieve transactions for the given customer within the specified date range
    const transactions = await Transaction.find({
      customerId,
      date: {
        $gte: Math.floor(new Date(from) / 1000),
        $lte: Math.floor(new Date(to) / 1000),
      },
    })
      .populate("customerId")
      .populate("items");
    // .populate({ path: "items.itemId" });

    console.log(transactions);

    const UpdatedTransactions = transactions
      .map((data) => {
        const itemsData = data.items
          .map((dt) => {
            if (!dt.itemId) {
              return null; // Skip items with null or undefined itemId
            }
            return {
              _id: dt._id,
              itemId: dt.itemId._id,
              date: data.date,
              invoice_no: data.invoice_no,
              article_name: dt.article_name,
              article_size: dt.article_size,
              qty: dt.qty,
              purchase: dt.purchase,
              price: dt.price,
              amount: dt.amount,
            };
          })
          .filter((item) => item !== null); // Remove null entries from the array
        return itemsData;
      })
      .flat();

    return successMessage(
      res,
      UpdatedTransactions,
      "Transactions retrieved successfully!"
    );
  } catch (err) {
    console.error("Error occurred while fetching transactions:", err);
    return createError(res, 500, err.message || "Internal Server Error");
  }
};
const GetInvoiceData = async (req, res) => {
  const { invoice_no, type } = req.body;
  // console.log(req.body);

  // return successMessage(res, transactions, "");
  try {
    // console.log(req.body);

    if (!invoice_no) {
      return createError(res, 422, "Invoice # is required!");
    } else if (!type) {
      return createError(res, 422, "Type is required!");
    }

    // Retrieve transactions for the given customer within the specified date range
    if (type === 1) {
      const transactions = await Transaction.find({ invoice_no })
        .populate("customerId")
        .populate({
          path: "items",
          populate: {
            path: "itemId",
          },
        });

      const UpdatedTransactions = transactions
        .map((data) => {
          const itemsData = data.items
            .map((dt) => {
              if (!dt.itemId) {
                return null; // Skip items with null or undefined itemId
              }
              return {
                _id: dt._id,
                itemId: dt.itemId._id,
                date: data.date,
                invoice_no: data.invoice_no,
                article_name: dt.article_name,
                article_size: dt.article_size,
                qty: dt.qty,
                purchase: dt.purchase,
                price: dt.price,
                amount: dt.amount,
              };
            })
            .filter((item) => item !== null); // Remove null entries from the array
          return itemsData;
        })
        .flat();
      return successMessage(
        res,
        { Invoice_Info: transactions[0], Data: UpdatedTransactions },
        "Transactions retrieved successfully!"
      );
    } else if (type === 2) {
      const transactions = await Return.find({ invoice_no })
        .populate("customerId")
        .populate({
          path: "items",
          populate: {
            path: "itemId",
          },
        });
      const UpdatedTransactions = transactions
        .map((data) => {
          const itemsData = data.items.map((dt) => {
            return {
              _id: dt._id,
              itemId: dt.itemId._id,
              date: data.date,
              invoice_no: data.invoice_no,
              article_name: dt.article_name,
              article_size: dt.article_size,
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
        { Invoice_Info: transactions[0], Data: UpdatedTransactions },
        "Returns retrieved successfully!"
      );
    }

    // const UpdatedTransactions = transactions
    //   .map((data) => {
    //     const itemsData = data.items
    //       .map((dt) => {
    //         if (!dt.itemId) {
    //           return null; // Skip items with null or undefined itemId
    //         }
    //         return {
    //           _id: dt._id,
    //           itemId: dt.itemId._id,
    //           date: data.date,
    //           invoice_no: data.invoice_no,
    //           article_name: dt.article_name,
    //           article_size: dt.article_size,
    //           qty: dt.qty,
    //           purchase: dt.purchase,
    //           price: dt.price,
    //           amount: dt.amount,
    //         };
    //       })
    //       .filter((item) => item !== null); // Remove null entries from the array
    //     return itemsData;
    //   })
    //   .flat();
  } catch (err) {
    console.error("Error occurred while fetching transactions:", err);
    return createError(res, 500, err.message || "Internal Server Error");
  }
};

const GetItemSummary = async (req, res) => {
  const { customerId } = req.body;

  if (!customerId) {
    return createError(res, 422, "Invalid Customer ID!");
  }

  try {
    const transactions = await Transaction.find({ customerId })
      .populate("customerId")
      .populate({
        path: "items",
        populate: { path: "itemId" }, // Populate the itemId field inside the items array
      });

    const UpdatedTransactions = transactions
      .map((data) => {
        const itemsData = data.items.map((dt) => {
          return {
            code: dt.itemId.code,
            name: dt.itemId.name,
            qty: dt.qty,
            price: dt.price,
          };
        });
        return itemsData;
      })
      .flat();

    // const arrayOfItems = transactions.flatMap((dt) => dt.items);

    // const newArray = arrayOfItems.map((dt) => {
    //   // If item doesn't have code property, return a new object with necessary properties
    //   return {
    //     code: dt.itemId.code,
    //     name: dt.itemId.name,
    //     price: dt.itemId.sale,
    //     qty: dt.qty,
    //   };
    // });

    const copyNewArray = [...UpdatedTransactions];

    const updatedArray = [];
    UpdatedTransactions.map((dt) => {
      let currentIndex = -1;
      const exists = updatedArray.some((item, index) => {
        if (item.code === dt.code) {
          currentIndex = index;
          return true;
        } else false;
      });
      if (exists) {
        let temp = updatedArray[currentIndex];
        temp = {
          ...temp,
          price: temp.code === "SH" ? dt.price + temp.price : dt.price,
          qty: temp.qty + dt.qty,
        };
        updatedArray[currentIndex] = temp;
      } else {
        updatedArray.push(dt);
      }
    });

    return successMessage(
      res,
      updatedArray,
      "Transactions retrieved successfully!"
    );
  } catch (err) {
    console.error("Error occurred while fetching transactions:", err);
    return createError(res, 500, err.message || "Internal Server Error");
  }
};

const DeleteInvoice = async (req, res) => {
  const { customerId, invoice_no: current_invoice_no } = req.body;

  try {
    const transactions = await Transaction.find({
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
          { $inc: { qty: qty, out_qty: -qty } }, // Decrement qty field by decrementQty
          { new: true } // Return the updated document
        );
      })
    );

    const updateCustomerAccount = await Customer.findByIdAndUpdate(
      customerId,
      {
        $inc: {
          total: -Number(totalAmount),
          remaining: -Number(totalAmount) + Number(totalDiscount),
          discount: -Number(totalDiscount),
        },
      }, // Decrement qty field by decrementQty
      { new: true }
    );

    const deleteTransaction = await Transaction.deleteOne({
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

const UpdateInvoiceItem = async (req, res) => {
  const {
    customerId,
    CurrentInvoiceInfo,
    DeleteInvoicesId,
    UpdateInvoiceData,
  } = req.body;

  console.log(req.body);
  // return createError(res, 422, "testing!");

  try {
    // const UpdatedProduct = await Product.findByIdAndUpdate(
    //   InvoiceInfo._id,
    //   {
    //     price: updateValue.price,
    //     qty: updateValue.qty,
    //     amount: updateValue.amount,
    //   },
    //   {
    //     new: true,
    //   }
    // );

    // const UpdateTransaction = await Transaction.findOneAndUpdate(
    //   {
    //     invoice_no: InvoiceInfo.invoice_no,
    //   },
    //   {
    //     $inc: {
    //       total_amount:
    //         -Number(InvoiceInfo.amount) + Number(updateValue.amount),
    //     },
    //   }, // Decrement qty field by decrementQty
    //   { new: true }
    // );

    // const updateCustomerAccount = await Customer.findByIdAndUpdate(
    //   customerId,
    //   {
    //     $inc: {
    //       total: -Number(InvoiceInfo.amount) + Number(updateValue.amount),
    //       remaining: -Number(InvoiceInfo.amount) + Number(updateValue.amount),
    //     },
    //   }, // Decrement qty field by decrementQty
    //   { new: true }
    // );

    // const ItemQtyUpdated = await Item.findByIdAndUpdate(
    //   InvoiceInfo.itemId,
    //   {
    //     $inc: {
    //       qty: Number(InvoiceInfo.qty) - Number(updateValue.qty),
    //       out_qty: -Number(InvoiceInfo.qty) + Number(updateValue.qty),
    //     },
    //   }, // Decrement qty field by decrementQty
    //   { new: true } // Return the updated document
    // );

    // if (updateCustomerAccount)
    // return successMessage(
    //   res,
    //   UpdateTransaction,
    //   "Invoice item successfully updated!"
    // );
    // else
    return createError(res, 400, "Unable to Update Invoice Item");
  } catch (err) {
    return createError(res, 400, err.message || "Internal server error!");
  }
};

module.exports = {
  CreateTransaction,
  GetTransactions,
  GetItemSummary,
  DeleteInvoice,
  CheckBillNumber,
  UpdateInvoiceItem,
  GetInvoiceData,
};
