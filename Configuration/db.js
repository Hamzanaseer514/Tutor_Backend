const mongoose = require("mongoose")
require("dotenv").config()

mongoose.set("strictQuery", false)
const ConnectToDB = async () => {
    try {
        await mongoose.connect(process.env.Mongo_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to Database")
    } catch (error) {
        console.error("Error Connecting to DB",error.message)
        process.exit(1);
    }
}


module.exports = { ConnectToDB }