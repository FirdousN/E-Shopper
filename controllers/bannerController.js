const mongoose = require('mongoose');
const { ObjectId } = require('mongoose');
const bannerModel = require('../models/banner-model');
const { uploadBannerImage } = require('../helpers/banner-helper');
const slugify = require('slugify');
const bannerHelper = require('../helpers/banner-helper');


module.exports = {
    
    getBanner:async(req,res)=>{
        try {
            let banners = await bannerHelper.findBanner()
            console.log(banners,'00000000000');
            res.render('admin/banner',{banners,admin: true})
        } catch (error) {
            console.log(error.message);
        }
    },

    getAddBanner:async(req,res)=>{
        try {
            res.render('admin/add-banner',{admin:true})
        } catch (error) {
            console.log(error.length);
        }
    },
    postAddBanner: async (req, res) => {
        try {
            console.log(req.body, 'body')

            const files = req.files
            const images = files.map((file) => {
                return file.filename
            })

            let bannerData = req.body;
            if (typeof bannerData.bannerName !== 'string' || bannerData.bannerName.trim() === '') {
                throw new Error('Invalid banner name');
              }

            bannerData.slug = slugify(bannerData.bannerName ,{lower:true});

            await bannerHelper.createBanner(bannerData , images)

          res.redirect('/admin/banner'); // Redirect to the banners list page
        } catch (error) {
          console.error(error);
          console.log(error.message);
          if (error.message === 'Banner already exists') {
              res.redirect('/admin/add-banner?error=' + encodeURIComponent('Banner already exists'));
          }
        }
      },
      getEditBanner:async (req,res)=>{
        try {
            let bannerId = req.params.id;
            console.log(bannerId,'❤️❤️');
            const banner = await bannerModel.findById({_id:bannerId});

            res.render('admin/edit-banner',{banner, admin: true})
        } catch (error) {
            console.log(error.message);
        }
      },
      postEditBanner:async (req,res)=>{
        try {
            console.log('post edit banner');
            let updatedData = req.body;
            
            let files = req.files;
            let bannerId = req.params.id;
            let images = []
            console.log(files, '💸 images 💸');

            if (files && files.length > 0) {
                images = files.map((file) => {
                    return file.filename;
                })
            }
            
            await bannerHelper.editBanner( bannerId, updatedData , images);
            res.redirect('/admin/banner')
        } catch (error) {
            console.log(error.message);
        }
      }
}