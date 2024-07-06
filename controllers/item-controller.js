const Joi = require("joi");
const Company = require("../Models/Company");
const Item = require("../Models/Item");
const { createError, successMessage } = require("../utils/ResponseMessage");

//******************************************************
// working
//******************************************************
const getAllItems = async (req, res, next) => {
  let items;
  try {
    items = await Item.find();
    if (!items) return createError(res, 404, "Items record not found!");
    return successMessage(res, items, null);
  } catch (err) {
    console.log(err);
    return createError(res, 500, err.message || err);
  }
};

const getBranchItems = async (req, res, next) => {
  const { branch } = req.body;
  // console.log(branch);

  const itemSchema = Joi.object({
    branch: Joi.number().required(),
  });

  const { error } = itemSchema.validate(req.body.values);
  if (error) return createError(res, 422, error.message);

  let items;
  try {
    if (branch === -1)
      items = await Item.find().populate("branchId").populate("articleId");
    else
      items = await Item.find({ branch })
        .populate("branchId")
        .populate("articleId");
    console.log(items);
    if (!items)
      return createError(res, 404, "Items record not found for branch!");
    else return successMessage(res, items, null);
  } catch (err) {
    console.log(err);
    return createError(res, 500, err.message || err);
  }
};
//******************************************************
// working
//******************************************************
const addManyItem = async (req, res, next) => {
  let item;
  const { data } = req.body;
  try {
    item = await Item.insertMany(data);
  } catch (err) {
    console.log(err);
  }
  if (!item) {
    return res.status(500).json({ message: "Unable to Add Item" });
  }
  return res.status(201).json({ item });
};
// Add Item
const addItem = async (req, res, next) => {
  let item;
  const {
    branchId,
    articleId,
    article_name,
    branch_name,
    size,
    purchase,
    sale,
    branch,
    addeddate = Math.floor(Date.now() / 1000),
  } = req.body;

  const reqStr = Joi.string().required();
  const reqNum = Joi.number().required();
  const reqObjId = Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required();

  const itemSchema = Joi.object({
    branchId: reqObjId,
    articleId: reqObjId,
    article_name: reqStr,
    branch_name: reqStr,
    size: reqStr,
    purchase: reqNum,
    sale: reqNum,
    branch: reqNum,
  });

  const { error } = itemSchema.validate(req.body);
  if (error) return createError(res, 422, error.message);

  try {
    item = await new Item({
      size,
      branchId,
      articleId,
      article_name,
      branch_name,
      purchase,
      sale,
      qty: 0,
      in_qty: 0,
      out_qty: 0,
      branch,
      addeddate,
    }).save();

    if (!item) return createError(res, 400, "Unable to add new Item!");
    return successMessage(res, item, "Item Successfully Created!");
  } catch (err) {
    return createError(res, 500, err.message || err);
  }
};

//******************************************************
// working done
//******************************************************
const updateItem = async (req, res) => {
  const { id } = req.params;
  const {
    size,
    branchId,
    articleId,
    purchase,
    sale,
    in_qty,
    out_qty,
    qty,
    branch,
    article_name,
    branch_name,
  } = req.body;

  if (!size || !articleId || !purchase || !sale) {
    return res
      .status(400)
      .json({ success: false, message: "Required fields are missing!" });
  }

  try {
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      {
        size,
        branchId,
        articleId,
        purchase,
        sale,
        in_qty,
        out_qty,
        qty,
        branch,
        article_name,
        branch_name,
        addeddate: Math.floor(Date.now() / 1000),
      },
      { new: true } // This option returns the modified document rather than the original
    );

    if (!updatedItem) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found!" });
    }

    res.json({
      success: true,
      message: "Item updated successfully!",
      data: updatedItem,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error. Please try again later.",
      });
  }
};
//******************************************************
// working
//******************************************************
const updateItemQty = async (req, res, next) => {
  // parameter
  const itemId = req.params.id;
  let item;
  // getting quantity from request
  let { itemqty } = req.body;
  const newQty = itemqty;
  // query data
  const itemFilter = { _id: itemId };
  const itemUpdate = { $inc: { itemqty: newQty } };
  try {
    item = Item.updateOne(itemFilter, itemUpdate, (err, result) => {
      if (err) {
        console.error("Failed to increment value:", err);
        res.status(500).send("Failed to increment value");
      } else {
        res.send("Value incremented successfully");
      }
    });
  } catch (err) {}
};
//******************************************************
// working
//******************************************************
const deleteItem = async (req, res, next) => {
  const { id: itemId } = req.params;
  if (!itemId) return createError(res, 422, "Invalid Item Id!");
  try {
    const DeleteItem = await Item.findByIdAndDelete(itemId);
    if (!DeleteItem)
      return createError(res, 400, "Such Item with itemId does not exist!");
    return successMessage(
      res,
      DeleteItem,
      `Item ${DeleteItem.name} is successfully deleted!`
    );
  } catch (error) {
    return createError(res, 500, error.message || error);
  }
};

module.exports = {
  getBranchItems,
  getAllItems,
  addItem,
  addManyItem,
  updateItem,
  deleteItem,
  updateItemQty,
};
