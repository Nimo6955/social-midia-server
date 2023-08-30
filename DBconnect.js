const mongoose = require('mongoose');


module.exports = async()=>{
    const mongooURI = "mongodb+srv://Cluster0:8RS0oCQ6gl7E2W8U@cluster0.dfj0em4.mongodb.net/?retryWrites=true&w=majority"
    
    try {
        
        const connect = await mongoose.connect(mongooURI, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        })

        console.log(`mongooDB connected: ${connect.connection.host}`);
    } catch (error) {
        console.log(error);
    }
}