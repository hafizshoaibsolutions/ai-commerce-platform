import User from "../models/user.model";
import { hashPassword } from "../utils/password.util";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";
import { RegisterUserInput } from "../validators/auth.validation";

export const registerUser = async (
  userData: RegisterUserInput,
  userAgent?: string,
) => {
  const { name, email, password } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await hashPassword(password);
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const accessToken = generateAccessToken(newUser._id.toString());
  const refreshToken = generateRefreshToken(newUser._id.toString());


  newUser.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    userAgent,
    createdAt: new Date(),
  });

  await newUser.save();

    return {
    user: {
      id:    newUser._id.toString(),
      name:  newUser.name,
      email: newUser.email,
      role:  newUser.role,
    },
    accessToken,
    refreshToken,
  };
};
