import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true, minLength: 6 },

    bio: { type: String, default: "" },

    profilePicture: { type: String, default: "" },

    nativeLanguage: { type: String, default: "" },

    learningLanguage: { type: String, default: "" },

    location: { type: String, default: "" },

    isOnboarded: { type: Boolean, default: false },

    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

///pre hook for password
userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.log(error.message);
  } 
});

//create user model
const User = mongoose.model("User", userSchema);



export default User;
