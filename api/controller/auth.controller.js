import User from "../models/user.models.js";
import bcryptjs from 'bcryptjs';

export const signup = async (req, res) => {
    //console.log(req.body);
    const {  username, email, password } = req.body;
    
    // adding bcryptjs to encrypt the password in the database
    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({ username, email, password:hashedPassword });
    try{
    await newUser.save()
    res.status(200).json({ message: "User created succesfully "});}
    catch(error){
       res.status(500).json({ message: "user already exists" });
    }
};