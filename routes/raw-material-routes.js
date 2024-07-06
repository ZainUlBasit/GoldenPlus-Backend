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
// router.patch("/update", StockController.UpdateSales);
// router.delete("/delete", StockController.DeleteSale);

module.exports = router;
