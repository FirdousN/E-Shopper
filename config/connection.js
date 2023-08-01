const mongoose = require('mongoose');
const MONGODB_URL = process.env.MONGODB_URL;

// MongoDB connection URL
mongoose.connect('mongodb+srv://FirdousN:FirdousN@cluster0.ti10wlb.mongodb.net', {
  dbName:'ecommerce'

})
  .then(() => {
    console.log('Database connected1');

  })
  .catch((error) => {
    console.log('Connection Error: ' + error);
  });

