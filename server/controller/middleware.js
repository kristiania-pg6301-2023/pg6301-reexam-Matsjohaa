export const attachUser = (db) => async (req, res, next) => {
  const { access_token } = req.signedCookies;

  if (!access_token) {
    return next(); // No token, proceed without attaching user
  }

  try {
    // Fetch user info from the database using the access token
    const user = await db.collection("users").findOne({ access_token });

    if (user) {
      req.user = user; // Attach user to the request object
    }
  } catch (err) {
    console.error("Error fetching user:", err);
  }

  next();
};

export const isAuthenticated = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res
      .status(401)
      .json({ error: "You must be logged in to perform this action" });
  }
};

export const isGitHubUser = (req, res, next) => {
  if (req.user && req.user.provider === "github") {
    next();
  } else {
    res
      .status(403)
      .json({ error: "Only GitHub users can perform this action" });
  }
};

export const isGoogleUser = (req, res, next) => {
  if (req.user && req.user.provider === "google") {
    next();
  } else {
    res
      .status(403)
      .json({ error: "Only Google users can perform this action" });
  }
};
