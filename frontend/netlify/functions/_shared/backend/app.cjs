const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { errors, celebrate, Joi } = require("celebrate");
const auth = require("./middlewares/auth");
const { requestLogger, errorLogger } = require("./middlewares/logger");
const usersRoute = require("./routes/usersRoutes");
const exercisesRoute = require("./routes/exercisesRoutes");
const { login, createUser } = require("./controllers/usersController");

const app = express();
let connectionPromise;

function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  if (!process.env.MONGODB_URI) {
    return Promise.reject(new Error("MONGODB_URI is not configured"));
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  return connectionPromise;
}

app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get("/api/health", async (req, res, next) => {
  try {
    await connectDatabase();
    res.send({ status: true });
  } catch (error) {
    next(error);
  }
});

app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.use("/api/users", auth, usersRoute);
app.use("/api/exercises", auth, exercisesRoute);

app.post(
  "/api/login",
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6),
    }),
  }),
  login
);

app.post(
  "/api/signup",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      lastname: Joi.string().required().min(2).max(30),
      role: Joi.string().required().valid("Trainer", "Trainee"),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6),
    }),
  }),
  createUser
);

app.use(errorLogger);
app.use(errors());

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : err.message;
  res.status(statusCode).send({ message });
});

module.exports = app;

