const mongoose = require("mongoose");
//const validator = require("validator");

const exerciseSchema = new mongoose.Schema({
  exercise: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  description: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 1000,
  },
  owner: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: "user",
  },
  completed: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: "user",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("exercise", exerciseSchema);
