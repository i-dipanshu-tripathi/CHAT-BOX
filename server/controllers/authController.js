const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

router.post("/signup", async (req, res) => {
  try {
    // ! If the user already exists
    const user = await User.findOne({ email: req.body.email });

    // ! If user exists , send an appropriate response
    if (user) {
      return res.send({
        message: "User already exists...",
        success: false,
      });
    }

    // ! Encrypt the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;

    // ! Create new user , save them in the DB
    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).send({
      message: "User created successfully",
      success: true,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    // ! Check if the user exists or not
    const user = await User.findOne({ email: req.body.email }).select(
      "+password"
    );

    // ! check if the password is correct or not
    if (!user) {
      return res.send({
        message: "User does not exist",
        success: false,
      });
    }

    const isValid = await bcrypt.compare(req.body.password, user.password);

    if (!isValid) {
      return res.send({
        message: "Invalid Password",
        success: false,
      });
    }

    // ! if the user exists & password is correct , assign a JWT
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    res.send({
      message: "User logged-in successfully",
      success: true,
      token: token,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

module.exports = router;
