const mongoose = require("mongoose")

function ConnectToDb(){
        mongoose.connect(process.env.MONGO_URI)// now you can access mongoUri string to connect to the db
        .then(()=>{
            console.log("Server is connected to db")
        })
        .catch(err=>{
            console.log("Error connecting to Db")
            process.exit(1) // means if the db will not connect to the server then immediately stop the server so that it doesnot consume any resources
        })
}

module.exports = ConnectToDb