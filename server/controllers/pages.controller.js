export const renderHome = (req, res) => {
  res.render("home", {
    title: "Volunteer Forum",
  });
};

export const exampleProtectedPage = (req, res) => {
  res.render("exampleProtectedPage", {
    title: "Protected Page",
    user: req.user.toObject(),
  });
};
