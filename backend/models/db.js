const  mongoose  = require("mongoose");
require('dotenv').config()

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
   
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Atlas connected'))
.catch(err => console.log('MongoDB connection error:', err));