const mongoose = require("mongoose");
const dbConnect = async () => {
  await mongoose.connect(
    // "mongodb://localhost:27017/devTinders"
    // "mongodb+srv://nishus877:IfN6f68E0jZqy7Sj@devtinder.ocvkb99.mongodb.net/devTinder"
    process.env.DB_CONNECTION_SECRET
  );
};
module.exports = dbConnect;
