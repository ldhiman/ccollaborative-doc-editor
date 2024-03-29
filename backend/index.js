const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const socketIo = require("socket.io");
const http = require("http");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.routes.js");
const docRouter = require("./routes/document.routes.js");
const { Verify, VerifyRole } = require("./auth/verify.js");
const { updateUser, findUserById } = require("./auth/user.js");
const Document = require("./models/Document.js");
const app = express();

app.use(
  cors({
    credentials: true,
    origin: "https://ccollaborative-doc-editor.vercel.app",
  })
);

console.log(process.env.BASE_URL);
console.log(process.env.DATABASE_URL);

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});

mongoose
  .connect(`${process.env.DATABASE_URL}`, { dbName: "auth" })
  .then(() => {
    console.log("Connected to MongoDB");
    const server = http.createServer(app);
    server.listen(3002, () => {
      console.log("Socket Server is running on port 3002");
    });

    const io = socketIo(server, {
      cors: { origin: "*", methods: ["GET", "POST"] },
    });
    const roomSockets = {};
    var clients = [];
    const customIdToUsernameMap = {};
    const clientIdToUsernameMap = {};

    io.on("connection", (socket) => {
      console.log("New client connected: " + socket.id);

      socket.on("storeClientInfo", function (data) {
        const clientInfo = {
          customId: data.customId,
          username: data.username,
          clientId: socket.id,
        };

        clients.push(clientInfo);
        // Update customIdToUsernameMap and clientIdToUsernameMap
        customIdToUsernameMap[data.customId] = data.username;
        clientIdToUsernameMap[socket.id] = data.username;

        console.log(`Client ${socket.id} saved as ${data.username}`);
      });

      socket.on("joinRoom", (docId) => {
        socket.join(docId);
        console.log(`Socket ${socket.id} joined room ${docId}`);
        if (!roomSockets[docId]) {
          roomSockets[docId] = [];
        }
        roomSockets[docId].push(socket);
      });

      socket.on("cursorUpdate", ({ doc, position, text }) => {
        const username = clientIdToUsernameMap[socket.id]; // Retrieve username using clientId
        socket.broadcast.to(doc).emit("cursorUpdate", {
          userId: socket.id,
          username,
          position,
          text,
        });
      });

      socket.on("mouseCursorUpdate", ({ userId, doc, x, y }) => {
        const username = customIdToUsernameMap[userId]; // Retrieve username using customId
        socket.broadcast.to(doc).emit("mouseCursorUpdate", {
          userId,
          username,
          position: { x, y },
        });
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected: " + socket.id);
        for (var i = 0, len = clients.length; i < len; ++i) {
          var c = clients[i];

          if (c.clientId == socket.id) {
            clients.splice(i, 1);
            break;
          }
        }
      });
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const authenticateToken = async (req, res, next) => {
  const token = req.cookies.token;

  console.log(req.cookies);
  if (!token) {
    req.isAuthenticated = false;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await findUserById(decoded.id);
    const newToken = await user.generateAccessJWT();
    res.cookie("token", newToken, { withCredentials: true });
    if (!user) {
      req.isAuthenticated = false;
      return res.status(500).json({ message: "Invalid Token" });
    }

    req.isAuthenticated = true;
    req.userId = decoded.id;
    req.email = user.email;
    next();
  } catch (err) {
    console.error("Error verifying token:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getEndpointsInfo = () => {
  const endpoints = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods).join(", ");
      const path = middleware.route.path;
      endpoints.push({ path, methods });
    }
  });
  return endpoints;
};

app.use(authenticateToken);

app.use("/auth", authRouter);

app.use("/document", docRouter);

app.post("/", authenticateToken, (req, res) => {
  if (req.isAuthenticated) {
    let response = {
      userID: req.userId,
      email: req.email,
    };
    console.log(response);
    res.status(200).json(response);
  } else {
    res.status(400).json({ isAuthenticated: false });
  }
});

app.get("/v1", (req, res) => {
  try {
    const endpoints = getEndpointsInfo();
    res.status(200).json({
      status: "success",
      endpoints,
      message: "Welcome to our API homepage!",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

app.get("/v1/user", authenticateToken, Verify, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to your Dashboard!",
  });
});

app.get("/v1/admin", authenticateToken, Verify, VerifyRole, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the Admin portal!",
  });
});

app.put("/v1/user/update", authenticateToken, Verify, async (req, res) => {
  try {
    const { userInfo } = req.body;
    const response = await updateUser(req.userId, userInfo);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    error: true,
    statusCode,
    message,
  });
});
