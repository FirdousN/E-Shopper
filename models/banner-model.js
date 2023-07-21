const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bannerSchema = new Schema({
  title: {
    type: String,
    required: true
  },
//   imageName:
//   ,
  image: [],
  description: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  slug: {
    type: String,
    unique: true 
  },
  offer: {
    type: String,
    required: true
  },
    
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
