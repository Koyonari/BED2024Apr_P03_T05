const User = require("../models/user_sql");

const createUser = async (req, res) => {
  const newUser = req.body;
  console.log("New User Set", newUser);  // Add this line to log the incoming request body
  try {
    const createdUser = await User.createUser(newUser);
    res.status(201).json(createdUser);
    } catch (error) {
    console.error(error);
    res.status(500).send("Error creating user");
  }
};


const getUserByUID = async (req, res) => {
  const userId = req.params.user_id;
  try {
    const user = await User.getUserByUID(userId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching user");
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving users");
  }
};

module.exports = {
  createUser,
  getUserByUID,
  getAllUsers,
};