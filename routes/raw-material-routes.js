const router = require("express").Router();
const { VerifyUserCookie, VerifyBranch } = require("../Middleware/auth");
const RMController = require("../controllers/RawMaterialStockController");

router.post(
  "/add",
  VerifyUserCookie,
  VerifyBranch,
  RMController.AddRawMaterialStock
);
router.post("/branch", VerifyUserCookie, RMController.GetStockByBranch);
router.patch("/edit", VerifyUserCookie, RMController.EditRawMaterialStock);
router.post("/delete", VerifyUserCookie, RMController.DeleteRMStock);
// router.patch("/update", StockController.UpdateSales);
// router.delete("/delete", StockController.DeleteSale);

module.exports = router;
