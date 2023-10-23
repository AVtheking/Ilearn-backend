const express = require("express");
const mongoose = require("mongoose");
const signupRouter = require("./routes/userRouters/signupRoute")
const loginRouter = require("./routes/userRouters/loginRoute")

require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/signUp', signupRouter);
app.use('/login', loginRouter);
app.get('/', function(req,res){
  console.log('Still working');
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.DB).then(() => {
  console.log("connection is successful");
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
