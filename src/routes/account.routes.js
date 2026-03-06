const express = require ("express")

const router = express.Router()
const authMiddleware = require("../middleware/auth.middleware")
const accountController = require("../controller/account.controller")


/**
 * Post request  /api/accounts
 * Create new account
 * Protected routes
 */

router.post("/",authMiddleware.authMiddleware,accountController.createAccountController)

/**
 * get request /api/accounts
 * fetch all the account of the login user
 * protected route
 */

router.get("/",authMiddleware.authMiddleware,accountController.getUserAccountController)

/**
 * get request to fetch balance of the user
 * get Api = /api/accounts/balance/:accountId
 */

router.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getUserBalanceController)

module.exports = router