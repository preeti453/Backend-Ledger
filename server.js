// here we will start the server

require("dotenv").config() // without this you cannot use mongo_Uri string

const app = require('./src/app')
const connectToDb = require('./src/config/db')

connectToDb() 

app.listen(3000,()=>{
    console.log("Server is running on port 3000")
})

// npx = node package executer this is used to execute package and nodemon is a package whose work is to just start the server after every changes in the program 

// after connecting mongo atlas and the clutser and we will make database connection here
