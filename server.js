const express = require("express")
const app = express()
require("dotenv").config()
const PORT = process.env.PORT || 4000



//  Imports 
const {ConnectToDB} = require("./Configuration/db")
const {errorHandler} = require("./Middleware/errorHandler")
const cookieParser = require("cookie-parser");
const UserRoute = require("./Routes/UserRoute")
const tutorRoutes = require("./Routes/tutorRoutes")




app.use(express.json());
app.use(errorHandler)
app.use(cookieParser());


app.use('/api/auth',UserRoute)
app.use('/api/tutor', tutorRoutes)




ConnectToDB().then(() => {
    console.log("Database is connected")
}).catch(() => {
    console.log("Database not connected")
})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})