import User from "../models/user.model.js";

const findUserByEmail = (email) => {
  return User.findOne({ email });
};

const createUser = (data) => {
  return User.create(data);
};

const findUserByVerificationToken = (token) => {
  return User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: {
      $gt: Date.now(),
    },
  });
};

const saveUser = (user) => {
  return user.save();
};

export { findUserByEmail, 
    createUser, 
    findUserByVerificationToken, 
    saveUser };
