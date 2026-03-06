const express = require("express")
const authController = require("../controller/auth.controller")

const router = express.Router()

// register API = /api/auth/register (user can register its account in this api)
router.post("/register",authController.userRegisterController)

// login API = /api/auth/login
router.post("/login",authController.userLoginController)

// logout API = /api/auth/logout
router.post("/logout",authController.userLogoutController)

module.exports = router