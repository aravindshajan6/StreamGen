import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import { upsertStreamUser } from "../lib/stream.js";

export async function signup(req, res) {
  console.log("inside signup route");

  const { fullName, email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  try {
    //checks for user details while signing up
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required!",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be minimum of 6 characters!",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format!",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: `User with email ${email} already exists! `,
      });
    }

    const newUser = await User.create({
      fullName,
      email,
      password,
    });
    console.log(`User created successfully - ${newUser.fullName}`);

    // create user in stream.io as well
    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        fullName: newUser.fullName,
        image: newUser.profilePicture || "",
      });
      console.log("steam user created successfully for ", newUser.fullName);
    } catch (error) {
      console.log("error creating user in stream.io - ", error.message);
    }

    //JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({
      message: "User created successfully!",
      success: true,
      user: {
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.log("Error in signup controller");
    res.status(500).json({
      error: error.message,
    });
  }
}
export async function login(req, res) {
  console.log("inside login route");

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required!",
      });
    }

    //check for user in DB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "User not found!",
      });
    }
    const passwordMAtch = await bcrypt.compare(password, user.password);
    if (!passwordMAtch) {
      return res.status(401).json({
        message: "Incorrect password!",
      });
    } else {
      console.log("password matched!");
    }

    //create jwt token and send it through cookie
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });
    console.log("JWT token - ", token);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      message: "Login successful!",
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Error in login controller - ", error.message);
    res.status(500).json({
      message: "Internal server error!",
    });
  }
}
export function logout(req, res) {
  console.log("inside logout route");
  res.clearCookie("token", "jwt");
  res.status(200).json({
    message: "Logout successful!",
    success: true,
  });
}

export async function onboard(req, res) {
  try {
    //if protectedRoute passed, user value will be available
    console.log("user inside onboard route - ", req.user);
    const { fullName, bio, nativeLanguage, learningLanguage, location } =
      req.body;
    //default values for missing fields
    if (
      !fullName ||
      !bio ||
      !nativeLanguage ||
      !learningLanguage ||
      !location
    ) {
      res.status(400).json({
        message: "All fields are required!",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }

    //update values in DB
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    //TODO : update user in stream
    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePicture || "",
      });
      console.log(
        "Stream user updated after onboarding for user - ",
        updatedUser.fullName
      );
    } catch (streamError) {
      console.error("Error updating user in stream:", streamError);
    }
    console.log("User updated successfully - ", updatedUser);
    res.status(200).json({
      message: "User onboarded successfully!",
      user: updatedUser,
      success: true,
    });
  } catch (error) {
    console.log("Error in onboarding controller - ", error.message);
    res.status(500).json({
      message: "Internal server error!",
    });
  }
}
