const multer = require('multer');
const bannerModel = require('../models/banner-model')

module.exports = {
    createBanner: async (bannerData, images) => {
        try {
            console.log(bannerData, images, 'Create Banner');
            // Check if the slug already exists
            const existingBanner = await bannerModel.findOne({ slug: bannerData.slug });
            if (existingBanner) {
                throw new Error('Banner with the same slug already exists');
            }

            const newBanner = new bannerModel({
                title: bannerData.bannerName,
                image: images,
                slug: bannerData.slug,
                description: bannerData.description,
                link: bannerData.link,
                offer: bannerData.offer
            });

            await newBanner.save();

            return newBanner;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    findBanner: async () => {
        try {
            let banners = await bannerModel.find();
            console.log(banners);
            return banners;
        } catch (error) {
            console.log(error.message);
        }
    },
    editBanner: async (bannerId, updatedData, images) => {
        try {
            console.log(bannerId, updatedData, images, '❤️❤️');
            if (!images || images.length === 0) {
                const banner = await bannerModel.findOne({ _id: bannerId });
                // Check if the banner exists and has an image
                if (banner && banner.image) {
                    // Assign the existing image to the 'images' variable
                    images = [banner.image];
                } 
            }
            await bannerModel.findByIdAndUpdate(
                { _id: bannerId },
                { $set: { updatedData, image: images } }
            );

        } catch (error) {
            console.log(error.message);
        }
    }
};