import User from "../models/user.models.js";
import bcryptjs from 'bcryptjs';
import { errorHandler } from "../utils/error.js";
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
    //console.log(req.body);
    const {  username, email, password } = req.body;
    
    // adding bcryptjs to encrypt the password in the database
    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({ username, email, password:hashedPassword });
    try{
    await newUser.save()
    res.status(200).json({ message: "User created succesfully "});}
    catch(error){
    //    res.status(500).json({ message: "user already exists" });
       next(error);
    }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {

    const validUser = await User.findOne({ email});
    if(!validUser) return next(errorHandler(404, 'User not found'));
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if( !validPassword) return next(errorHandler(401, 'wrong credential!'));

    // when both email, password are correct we add a cookie inside the browser
    // we need to create hashed token using jwt
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password:pass, ...rest} = validUser._doc;
    res
      .cookie('access_token', token, { httpOnly: true })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
}