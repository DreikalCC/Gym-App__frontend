import { withLambda } from "@netlify/aws-lambda-compat";
import bcrypt from "bcryptjs";
import { celebrate, errors as celebrateErrors, Joi } from "celebrate";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import serverless from "serverless-http";
import validator from "validator";

const app = express();
let connectionPromise;

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const userSchema = new mongoose.Schema({
  name: { type: String, minlength: 2, maxlength: 30, default: "Jacques" },
  lastname: { type: String, minlength: 2, maxlength: 30, default: "Cousteau" },
  role: { type: String, minlength: 2, maxlength: 30, default: "trainee" },
  email: {
    type: String,
    required: [true, "Email requerido"],
    unique: true,
    validate: (value) => validator.isEmail(value),
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  trainees: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: "User",
  },
  trainer: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: "User",
  },
});

userSchema.statics.findUserByCredentials = async function findUserByCredentials(
  email,
  password
) {
  const user = await this.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(401, "Email o password incorrecto");
  }
  return user;
};

const exerciseSchema = new mongoose.Schema({
  exercise: { type: String, required: true, minlength: 2, maxlength: 30 },
  description: { type: String, required: true, minlength: 2, maxlength: 1000 },
  owner: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: "User",
  },
  completed: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Exercise =
  mongoose.models.Exercise || mongoose.model("Exercise", exerciseSchema);

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI)
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }
  await connectionPromise;
}

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function authenticate(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization?.startsWith("Bearer ")) {
    return next(new HttpError(401, "No se cuenta con autorización"));
  }
  if (!process.env.JWT_SECRET) {
    return next(new Error("JWT_SECRET is not configured"));
  }
  try {
    req.user = jwt.verify(authorization.slice(7), process.env.JWT_SECRET);
    return next();
  } catch {
    return next(new HttpError(401, "No se cuenta con autorización"));
  }
}

app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get(
  "/api/health",
  asyncRoute(async (req, res) => {
    await connectDatabase();
    res.send({ status: true });
  })
);

app.use(
  asyncRoute(async (req, res, next) => {
    await connectDatabase();
    next();
  })
);

app.post(
  "/api/signup",
  celebrate({
    body: Joi.object({
      name: Joi.string().required().min(2).max(30),
      lastname: Joi.string().required().min(2).max(30),
      role: Joi.string().required().valid("trainer", "trainee"),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6),
    }),
  }),
  asyncRoute(async (req, res) => {
    const { name, lastname, role, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      lastname,
      role,
      email,
      password: hash,
    });
    res.status(201).send({ email: user.email, _id: user._id });
  })
);

app.post(
  "/api/login",
  celebrate({
    body: Joi.object({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6),
    }),
  }),
  asyncRoute(async (req, res) => {
    const user = await User.findUserByCredentials(
      req.body.email,
      req.body.password
    );
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.send({ user, token, message: "¡Bienvenido de vuelta!" });
  })
);

app.use("/api/users", authenticate);
app.get(
  "/api/users",
  asyncRoute(async (req, res) => {
    const data = await User.find({});
    res.send({ status: true, data });
  })
);
app.get(
  "/api/users/me",
  asyncRoute(async (req, res) => {
    const data = await User.findById(req.user._id);
    if (!data) throw new HttpError(404, "No se ha encontrado ningún usuario");
    res.send({ status: true, data });
  })
);
app.patch(
  "/api/users/me",
  celebrate({
    body: Joi.object({
      name: Joi.string().required().min(2).max(30),
      lastname: Joi.string().required().min(2).max(30),
    }),
  }),
  asyncRoute(async (req, res) => {
    const data = await User.findByIdAndUpdate(
      req.user._id,
      { name: req.body.name, lastname: req.body.lastname },
      { new: true, runValidators: true }
    );
    if (!data) throw new HttpError(404, "No se ha encontrado ningÃºn usuario");
    res.send({ status: true, data });
  })
);
app.put(
  "/api/users/me/trainer",
  asyncRoute(async (req, res) => {
    const data = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { trainer: req.body.trainer } },
      { new: true }
    );
    if (!data) throw new HttpError(404, "No se ha encontrado ningún usuario");
    res.send({ status: true, data });
  })
);
app.get(
  "/api/users/:id",
  asyncRoute(async (req, res) => {
    const data = await User.findById(req.params.id);
    if (!data) throw new HttpError(404, "No se ha encontrado ningún usuario");
    res.send({ status: true, data });
  })
);
app.put(
  "/api/users/:id/trainees",
  asyncRoute(async (req, res) => {
    const data = await User.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { trainees: req.body.trainee } },
      { new: true }
    );
    if (!data) throw new HttpError(404, "No se ha encontrado ningún usuario");
    res.send({ status: true, data });
  })
);

app.use("/api/exercises", authenticate);
app.get(
  "/api/exercises",
  asyncRoute(async (req, res) => {
    const data = await Exercise.find({});
    res.send({ status: true, data });
  })
);
app.post(
  "/api/exercises",
  asyncRoute(async (req, res) => {
    const data = await Exercise.create({
      exercise: req.body.exercise,
      description: req.body.description,
      owner: req.body.owner,
    });
    res.status(201).send({ data });
  })
);
app.delete(
  "/api/exercises/:cardId",
  asyncRoute(async (req, res) => {
    const data = await Exercise.findByIdAndDelete(req.params.cardId);
    if (!data) throw new HttpError(404, "No se ha encontrado ningún ejercicio");
    res.send({ status: true, data });
  })
);
app.put(
  "/api/exercises/:cardId/completed",
  asyncRoute(async (req, res) => {
    const data = await Exercise.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { completed: req.user._id } },
      { new: true }
    );
    if (!data) throw new HttpError(404, "No se ha encontrado ningún ejercicio");
    res.send({ status: true, data });
  })
);
app.delete(
  "/api/exercises/:cardId/completed",
  asyncRoute(async (req, res) => {
    const data = await Exercise.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { completed: req.user._id } },
      { new: true }
    );
    if (!data) throw new HttpError(404, "No se ha encontrado ningún ejercicio");
    res.send({ status: true, data });
  })
);

app.use(celebrateErrors());
app.use((err, req, res, next) => {
  if (err?.code === 11000) {
    return res.status(409).send({ message: "Ese email ya está registrado" });
  }
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : err.message;
  return res.status(statusCode).send({ message });
});

export default withLambda(serverless(app));
