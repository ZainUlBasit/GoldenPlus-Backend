const accountControllers = require("../controllers/Account-Controller");

const router = require("express").Router();

router.post("/create", accountControllers.createAccount);
router.post("/get", accountControllers.getAccounts);
router.patch("/add-amount", accountControllers.updateAccountAmount);

module.exports = router;
