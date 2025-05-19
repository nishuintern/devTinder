const userRouter = require("express").Router();
const { userAuth } = require("../../middleware/Auth");
const User = require("../../models/User");
const connectionRequest = require("../../models/connectRequest");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await connectionRequest
      .find({
        toUserId: loggedInUser._id,
        status: "interested",
      })
      .populate("fromUserId", USER_SAFE_DATA);
    res.json({
      message: "Received Connection Requests",
      data: connectionRequests,
    });
  } catch (error) {
    res.status(400).send("Erroor:" + error.message);
  }
});
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await connectionRequest
      .find({
        $or: [
          { toUserId: loggedInUser._id, status: "accepted" },
          { fromUserId: loggedInUser._id, status: "accepted" },
        ],
      })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);
    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.json({
      message: "Connections",
      data,
    });
  } catch (error) {
    res.status(400).json("Error:" + error.message);
  }
});
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    // Find all requests where the logged-in user is the sender
    const sentRequests = await connectionRequest.find({
      fromUserId: loggedInUser._id,
    }).select("toUserId");

    // Find all accepted connections (as before)
    const acceptedConnections = await connectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    }).select("fromUserId toUserId");

    // Build a set of user IDs to hide
    const hideUsersFromFeed = new Set();
    acceptedConnections.forEach((request) => {
      hideUsersFromFeed.add(request.fromUserId.toString());
      hideUsersFromFeed.add(request.toUserId.toString());
    });
    sentRequests.forEach((request) => {
      hideUsersFromFeed.add(request.toUserId.toString());
    });

    // Always hide yourself
    hideUsersFromFeed.add(loggedInUser._id.toString());

    const users = await User.find({
      _id: { $nin: Array.from(hideUsersFromFeed) },
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.status(200).json({ users });
  } catch (error) {
    res.status(400).json({
      message: "Error fetching feed" + error.message,
    });
  }
});
module.exports = userRouter;
