const { VerifyUserCookie, VerifyAdmin } = require("../Middleware/auth");
const authControllers = require("../controllers/authControllers");

const router = require("express").Router();
router.post("/login", authControllers().login);
router.post("/logout", VerifyUserCookie, authControllers().logout);
router.post("/register", authControllers().register);
router.get("/refresh", VerifyUserCookie, authControllers().autoLogin);
router.get("/branch", authControllers().branches);
router.delete("/branch/:id", authControllers().deleteBranch);
router.patch("/branch", authControllers().updateBranch);

module.exports = router;
