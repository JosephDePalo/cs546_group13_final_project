import User from "../models/user.model.js";

export const renderHome = (req, res) => {
  res.render("home", {
    title: "Volunteer Forum",
  });
};

export const renderRegister = (req, res) => {
  res.render("register", {
    title: "Register | Volunteer Forum",
  });
};

export const exampleProtectedPage = (req, res) => {
  res.render("exampleProtectedPage", {
    title: "Protected Page",
    user: req.user.toObject(),
  });
};

export const renderLogin = (req, res) => {
  res.render("login", {
    title: "Login | Volunteer Forum",
  });
};

export const renderLeaderboard = async (req, res) => {
  const top_users = await User.getTopUsers();
  console.log(top_users);
  res.render("leaderboard", {
    title: "Leaderboard | Volunteer Forum",
    users: top_users,
  });
};
