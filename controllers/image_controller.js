const { ErrorHandler } = require("../middlewares/error");
 const path = require('path');
const Image = require('../models/image'); 

const imageCtrl = {
     uploadImage: async (req, res, next) => {
try{
     if (!req.file) {
      //throw new ErrorHandler(400, "No image uploaded.")
      return next(new ErrorHandler(400, "No image uploaded."));
      }
     const newImage = new Image({
         
      name: req.file.filename, 
       image: {
           data: req.file.buffer, 
           type: req.file.mimetype, 
         },
      });

      const savedImage = await newImage.save();

      if (savedImage) {
        return res.status(201).json({ message: "Image uploaded and saved." });
      } else {
        throw new ErrorHandler(500, "Error saving image.");
      }
    } catch (error) {
      next(error);
   }
}
};
module.exports = imageCtrl;
