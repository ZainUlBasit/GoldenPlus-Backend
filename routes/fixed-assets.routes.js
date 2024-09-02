const FixedAssetsControllers = require("../controllers/FixedAssets-Controller");

const router = require("express").Router();

router.post("/create", FixedAssetsControllers.createFixedAsset);
router.delete("/delete/:id", FixedAssetsControllers.deleteFixedAsset);
router.get("/get/:id", FixedAssetsControllers.getFixedAssets);
router.patch("/update/:id", FixedAssetsControllers.updateFixedAsset);
router.patch("/update-amount/:id", FixedAssetsControllers.updateAmount);

module.exports = router;
