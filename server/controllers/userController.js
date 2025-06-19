const router = require("express").Router();
const User = require("../models/user");
const authMiddleware = require("../middlewares/authMiddleware");
const cloudinary = require("../cloudinary");
// ! Get all the details of current logged-in-user
router.get("/get-logged-user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });

    res.send({
      message: "User is fetched successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error.message);
    res.send({
      message: error.message,
      success: false,
    });
  }
});

// ! Get the details of all the users
router.get("/get-all-users", authMiddleware, async (req, res) => {
  try {
    const allUsers = await User.find({ _id: { $ne: req.userId } });

    res.send({
      message: "All users fetched successfully",
      success: true,
      data: allUsers,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

router.post("/upload-profile-pic", authMiddleware, async (req, res) => {
  try {
    const image = req.body.image;
    // UPLOAD THE IMAGE TO THE CLOUDINARY
    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "CHAT-BOX",
    });

    // UPDATE THE USER MODEL AND SET THE PROFILE PIC PROPERTY
    console.log("userId from req.body:", req.userId);

    const updatedUser = await User.findByIdAndUpdate(
      { _id: req.userId },
      { profilePic: uploadedImage.secure_url },
      { new: true }
    );

    const user = res.send({
      message: "Profile pic uploaded successfully",
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

module.exports = router;
