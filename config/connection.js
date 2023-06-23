// const mongoose = require('mongoose');
// // const multer = require ('multer');


// mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true})
// const db = mongoose.connection
// db.on('error', (error) => console.log(error))
// db.once('open', () => console.log("Connected to mongoose"))

///
const mongoose = require('mongoose');

// MongoDB connection URI
mongoose.connect ('mongodb://127.0.0.1:27017/ecommerce', {

  useNewUrlParser: true,
  useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database connected1');
    
  })
  .catch((error) => {
    console.log('Connection Error: ' + error);
  });

