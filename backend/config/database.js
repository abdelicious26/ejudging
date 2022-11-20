const mongoose = require('mongoose');

const connectDB = async () =>{
    try{
        const conn = await mongoose.connect(process.env.DBCONNECTONLINE)
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    }
    catch(error){
        console.log(error)
    }
}
module.exports = connectDB