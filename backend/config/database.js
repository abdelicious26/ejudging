const mongoose = require('mongoose');

const connectDB = async () =>{
    try{
        const conn = await mongoose.connect(process.env.DBCONNECT)
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    }
    catch(error){
        console.log('error connection => ', error)
    }
}
module.exports = connectDB