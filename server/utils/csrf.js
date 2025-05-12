const csurf = require("csurf");

// Apply CSRF protection middleware
const csrfProtection = csurf({
  cookie: {
    key: "XSRF-TOKEN",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  },
});
