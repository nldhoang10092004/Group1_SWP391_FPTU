const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3003;

app.use(cors());
app.use(bodyParser.json());

const users = [
  { email: "students@gmail.com", password: "1234567890", role: "student" },
  { email: "admin@gmail.com", password: "admin123", role: "admin" }
];


app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: "fake-jwt-token-12345",
      user: {
        email: user.email,
        role: user.role || (user.email === "admin@gmail.com" ? "teacher" : "student") 
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid email or password"
  });
});


app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
