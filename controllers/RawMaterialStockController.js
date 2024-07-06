const Joi = require("joi");
const { createError, successMessage } = require("../utils/ResponseMessage");
const Stock = require("../Models/Stock");
const Item = require("../Models/Item");
const Company = require("../Models/Company");
const RawMaterials = require("../Models/RawMaterialStock");
const RawMaterialStock = require("../Models/RawMaterialStock");

const AddRawMaterialStock = async (req, res) => {
  console.log(req.body);
  const stockValidationSchema = Joi.object({
    branchId: Joi.string().required(),
    branch_name: Joi.string().required(),
    supplierId: Joi.string().required(),
    supplier_name: Joi.string().required(),
    rm_name: Joi.string().required(),
    qty: Joi.number().required(),
    purchase: Joi.number().required(),
    invoice_no: Joi.string().required(),
    truck_no: Joi.string().required(),
    date: Joi.date().required(),
    branch: Joi.number().required(),
    desc: Joi.string().required(),
  });

  const { error } = stockValidationSchema.validate(req.body);
  if (error) return createError(res, 422, error.message);

  const {
    branchId,
    branch_name,
    supplierId,
    supplier_name,
    rm_name,
    qty,
    purchase,
    invoice_no,
    truck_no,
    date,
    desc,
    branch,
  } = req.body;

  try {
    // Create a new RawMaterialStock document
    const newStock = await new RawMaterialStock({
      branchId,
      branch_name,
      branch,
      supplierId,
      supplier_name,
      rm_name, // item name - Raw Material Item Name
      qty,
      purchase,
      total_amount: purchase * qty,
      invoice_no,
      truck_no,
      date: Math.floor(new Date(date).getTime() / 1000),
      desc,
    }).save();

    const updateValue = {
      $inc: { total: qty * purchase, remaining: qty * purchase },
    };

    // Assuming you have a Company model to update company accounts
    const updatedSupplier = await Company.findByIdAndUpdate(
      supplierId,
      updateValue,
      { new: true }
    );

    if (!updatedSupplier)
      return createError(res, 400, "Unable to update Supplier Accounts!");

    if (!newStock)
      return createError(res, 400, "Unable to add Stock in Raw Materials!");
    return successMessage(res, newStock, "Stock Successfully Added!");
  } catch (err) {
    console.error("Error adding stock:", err);
    return createError(res, 500, err.message || err);
  }
};

const GetStockByAdmin = async (req, res) => {
  const { startDate = 0, endDate = Math.floor(Date.now() / 1000) } = req.body;
  try {
    const StockStats = await Stock.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate("itemId")
      .populate("companyId");
    console.log("stats amdin:", StockStats);
    if (!StockStats) return createError(res, 404, "No record found!");
    return successMessage(res, StockStats, null);
  } catch (err) {
    console.log("Error while getting Stock Stats: ", err);
    return createError(res, 500, err.message || err);
  }
};
const GetStockByBranch = async (req, res) => {
  let { branchId } = req.body;
  if (!branchId) return createError(res, 422, "Invalid Branch Id!");

  // let reqBody = companyId
  //   ? {
  //       companyId,
  //       date: {
  //         $gte: Math.floor(new Date(startDate) / 1000),
  //         $lte: Math.floor(new Date(endDate) / 1000),
  //       },
  //     }
  //   : {
  //       date: {
  //         $gte: 0,
  //         $lte: Math.floor(Date.now() / 1000),
  //       },
  //     };

  // reqBody;
  try {
    const StockStats = await RawMaterialStock.find(
      branchId || branchId !== -1
        ? {
            branchId,
          }
        : {}
    ).populate("branchId");

    if (!StockStats)
      return createError(res, 404, `No record found of Branch ${branchId}!`);
    return successMessage(res, StockStats, "Stock successfully retrieved!");
  } catch (err) {
    console.log("Error while getting Stock Stats: ", err);
    return createError(res, 500, err.message || err);
  }
};

module.exports = {
  AddRawMaterialStock,
  GetStockByBranch,
};
