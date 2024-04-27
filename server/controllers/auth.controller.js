const signupUser = async (req, res) => {
  res.json({
    data: "You Hit signup endpoint",
  });
};

const loginUser = async (req, res) => {
  res.json({
    data: "You Hit login endpoint",
  });
};

const logoutUser = async (req, res) => {
  res.json({
    data: "You Hit logout endpoint",
  });
};

export { signupUser, loginUser, logoutUser };
