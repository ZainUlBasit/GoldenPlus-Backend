const Joi = require("joi");
const { createError, successMessage } = require("../utils/ResponseMessage");
const Article = require("../Models/Article");
const Stock = require("../Models/Stock");
const Transaction = require("../Models/Transaction");
const Payment = require("../Models/Payment");

const getArticleStats = async (req, res, next) => {
  const articleId = req.params.id;
  try {
    const articleDetails = await Article.findById(articleId);
    console.log(articleDetails);

    const StockStats = await Stock.find({ articleId })
      .populate("branchId")
      .populate("articleId")
      .populate("sizeId");

    const transactions = await Transaction.find({})
      .populate("customerId")
      .populate("items");

    const formattedTransactions = transactions.map((transaction) => ({
      ...transaction,
      customer_name: transaction.customerId.name,
      branch: transaction.customerId.branch,
      items: transaction.items,
      invoice_no: transaction.invoice_no,
      date: transaction.date,
    }));

    const filteredTransactions = formattedTransactions
      .filter((transaction) => transaction.branch === articleDetails.branch)
      .map((transaction) => ({
        ...transaction,
        items: transaction.items.filter(
          (item) => item.article_name === articleDetails.name
        ),
      }))
      .filter((transaction) => transaction.items.length > 0);

    const UpdatedTransactions = filteredTransactions.flatMap((transaction) =>
      transaction.items
        .map((item) =>
          item.itemId
            ? {
                _id: item._id,
                itemId: item.itemId._id,
                date: transaction.date,
                customer_name: transaction.customer_name,
                invoice_no: transaction.invoice_no,
                article_name: item.article_name,
                article_size: item.article_size,
                qty: item.qty,
                purchase: item.purchase,
                price: item.price,
                amount: item.amount,
              }
            : null
        )
        .filter(Boolean)
    );

    if (!StockStats) return createError(res, 404, "No Article record found!");
    return successMessage(
      res,
      { StockStats: StockStats, trans: UpdatedTransactions },
      null
    );
  } catch (err) {
    console.log(err);
    return createError(res, 500, err.message || "Internal server error!");
  }
};

module.exports = {
  getArticleStats,
};
