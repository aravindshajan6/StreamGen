import FriendRequest from "../models/FriendRequest.model.js";
import User from "../models/UserModel.js";

export async function getRecommendedUsers(req, res) {
  console.log("get recommended users running------->");
  try {
    const currentUserId = req.user.id;
    console.log("currentUserId ------->", currentUserId);
    const currentUser = await User.findById(currentUserId);
    // console.log("user in get recommendUser - ", currentUser);

    //get all users from DB and filter out the current user and users who are already friends with current user
    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, //exclude current user,
        { _id: { $nin: currentUser.friends } }, //exclude already friends users
        { isOnboarded: true }, //only onboarded users
      ],
    });
    console.log("recommendedUsers---------------------->", recommendedUsers);
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.log("Error in get recommended users - ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMyFriends(req, res) {
  console.log("get my friends running------->");
  try {
    const user = await User.findById(req.user._id)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePicture nativeLanguage learningLanguage"
      );
    console.log("user friends ------>", user.friends);

    res.status(200).json(user.friends);
  } catch (error) {
    console.log("Error in get my friends - ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function sendFriendRequest(req, res) {
  console.log("send friend request running------->");
  try {
    const myId = req.user._id;
    const { id: recipientId } = req.params;

    // console.log(myId, recipientId);
    //CHECKS
    //Prevent sending request to yourself
    if (myId.toString() === recipientId) {
      return res
        .status(400)
        .json({ message: "You cannot send a request to yourself" });
    }

    //check if user exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res
        .status(400)
        .json({ message: "User with this id does not exist" });
    }

    //prevent sending request to users who are already friends
    if (recipient.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user" });
    }

    //check if friend request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      console.log("friend request already exists");
      return res.status(400).json({ message: "Friend request already exists" });
    }

    //create friend request
    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });
    console.log("friend request created - ", friendRequest);
    res.status(200).json(friendRequest);
  } catch (error) {
    console.log("Error in send friend request - ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function acceptFriendRequest(req, res) {
  console.log("accept friend request running------->");
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(400).json({ message: "Friend request not found" });
    }

    //check if the current user is the recipient of the friend request
    if (friendRequest.recipient.toString() !== req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot accept this friend request" });
    }

    //accept friend request
    friendRequest.status = "accepted";
    await friendRequest.save();

    //update both senders and recipients friends list array
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in accept friend request - ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getFriendRequests(req, res) {
  console.log("get friend requests running------->");
  try {
    const incomingFriendRequests = await FriendRequest.find({
      recipient: req.user._id,
      status: "pending",
    }).populate(
      "sender",
      "fullName profilePicture nativeLanguage learningLanguage"
    );

    const acceptedRequests = await FriendRequest.find({
      sender: req.user._id,
      status: "accepted",
    }).populate(
      "recipient",
      "fullName profilePicture nativeLanguage learningLanguage"
    );

    res.status(200).json({ incomingFriendRequests, acceptedRequests });
  } catch (error) {
    console.log("Error in get friend requests - ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export async function getOutgoingFriendRequests(req, res) {
  try {
    const getOutgoingRequests = await FriendRequest.find({
      sender: req.user._id,
      status: "pending",
    }).populate(
      "recipient",
      "fullName profilePicture nativeLanguage learningLanguage"
    );

    res.status(200).json({ getOutgoingRequests });
  } catch (error) {
    console.log("Error in get outgoing friend requests - ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
