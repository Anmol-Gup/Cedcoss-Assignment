const connectDB = async (url) => {
  const mongoose = require("mongoose");
  try {
    mongoose
      .connect(url)
      .then(() => console.log("MongoDB connected..."))
      .catch((err) => console.log(err));
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = connectDB;
