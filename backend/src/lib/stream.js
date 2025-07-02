import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

console.log("apiKey - ", apiKey);
console.log("apiSecret - ", apiSecret);

if (!apiKey || !apiSecret) {
  console.log("Stream API key or Secret key not found!");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.log("error upserting stream user - ", error.message);
  }
};

export const generateStreamToken = (userId) => {
  try {
    // ensure user id is a string
    const userIdString = userId.toString();
    const token = streamClient.createToken(userIdString);
    return token;
  } catch (error) {
    console.log("error generating stream token - ", error.message);
  }
};
