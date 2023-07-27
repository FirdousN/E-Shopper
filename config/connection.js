const mongoose = require('mongoose');
const MONGODB_URL = process.env.MONGODB_URL;

// MongoDB connection URL
mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Database connected1');

  })
  .catch((error) => {
    console.log('Connection Error: ' + error);
  });

