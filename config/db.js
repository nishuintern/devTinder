const mongoose = require("mongoose");
const dbConnect = async () => {
  await mongoose.connect(
    "mongodb://localhost:27017/devTinders"
  );
};
module.exports = dbConnect;
