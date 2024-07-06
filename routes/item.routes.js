const router = require("express").Router();
const { VerifyUserCookie, VerifyBranch } = require("../Middleware/auth");
const ItemController = require("../controllers/item-controller");

router.post("/create", VerifyUserCookie, VerifyBranch, ItemController.addItem);
router.post("/branch", VerifyUserCookie, ItemController.getBranchItems);
router.patch(
  "/update",
  VerifyUserCookie,
  VerifyBranch,
  ItemController.updateItem
);
router.delete(
  "/delete/:id",
  VerifyUserCookie,
  VerifyBranch,
  ItemController.deleteItem
);
router.get("/all", ItemController.getAllItems);

module.exports = router;
