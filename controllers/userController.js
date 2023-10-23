require("dotenv").config();
const User = require("../model/user");
const jwt =require("jsonwebtoken");
const secretKey= process.env.SECRETKEY;

const bcrypt = require("bcrypt");

async function userSignUp(req, res) {
    try {
        const { name, email, password } = req.body;
        const existingUser =await User.findOne({email})
        console.log("existingUser", existingUser);
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {username : name, email, password: hashedPassword };
        await User.create(user);
        jwt.sign({user}, secretKey ,{expiresIn :'300s'} , (err,token) =>{
            res.status(200).json({username : name, email ,token});
        })
       
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

async function userLogin(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const correctPassword = await bcrypt.compare(password, user.password);

      if (correctPassword) {
        const token = jwt.sign({ user }, secretKey, { expiresIn: '300s' });
        res.status(200).json({ message: 'User Logged In Successfully', token });
      } else {
        res.status(400).send('Password is Incorrect!');
      }
    } else {
      res.status(404).send('Email does not exist!');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
}
    module.exports = {
    userSignUp,
    userLogin
    };

