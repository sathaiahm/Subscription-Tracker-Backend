import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../modules/user.model.js";
import { JWT_SECRET, JWT_EXPRESS_IN } from "../config/env.js";

export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { username, email, password } = req.body;
    const name = username; // Map username to name for the database

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create([{ name, email, password: hashedPassword }], { session });

    const token = jwt.sign({ userId: newUser[0]._id }, JWT_SECRET, { expiresIn: JWT_EXPRESS_IN });

    // Set httpOnly auth cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: newUser[0],
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try{
    const { email,password } = req.body;

    const user = await User.findOne({email});

    if(!user){
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const isPasswordvalid = await bcrypt.compare(password,user.password);

    if(!isPasswordvalid){
      const error = new Error("Invalid password");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({userId:user._id},JWT_SECRET,{expiresIn:JWT_EXPRESS_IN})

    // Set httpOnly auth cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.status(200).json({
      success : true,
      message : 'User signed in successfully',
      data : {
        user
      }
    })





  }catch(error){
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie('token', { path: '/' });
    res.status(200).json({ success: true, message: 'Signed out successfully' });
  } catch (error) {
    next(error);
  }
};