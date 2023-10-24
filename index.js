const express = require("express");
const mongoose = require("mongoose");

const { errorMiddleware } = require("./middlewares/error");

const { authRouter } = require("./routes");

require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(errorMiddleware);
app.use(authRouter, errorMiddleware);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.DB).then(() => {
  console.log("connection is successful");
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
