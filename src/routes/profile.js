const profileRouter = require("express").Router();
const { userAuth } = require("../../middleware/Auth");
const { validateEditProfileData } = require("../utils/validation");
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(404).send("Profile Failed!!" + error.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Data");
    }
    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();
    res.status(200).json({
      message: `${loggedInUser.firstName},Your profile has been updated successfully`,
      data: loggedInUser,
    });
  } catch (error) {
    res.status(400).send("Update Failed:" + error.message);
  }
});

module.exports = profileRouter;

// src/routes/api
module.exports = profileRouter;
