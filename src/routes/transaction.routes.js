const express = require("express")

// this middleware is used here so that only valid user can make transactions
const authMiddleware = require("../middleware/auth.middleware") 
const transactionController = require("../controller/transaction.controller")
const transactionRoutes = express.Router()

/**
 * Post api = /api/transactions/
 * Creates a new transaction
 */
transactionRoutes.post("/",authMiddleware.authMiddleware,transactionController.createTransaction)

/**
 * create a route for systemUser
 * Post api = /api/transactions/system/intial-funds 
 * create intial funds transaction from systemUser
 */

transactionRoutes.post("/system/initial-funds",authMiddleware.authSystemUserMiddleware,transactionController.createInitialFundTransaction)


module.exports = transactionRoutes