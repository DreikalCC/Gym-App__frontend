const express = require("express");

const router = express.Router();

const {
  getAllUsers,
  getSpecificUser,
  getCurrentUser,
  selectTrainer,
  setTrainee,
} = require("../controllers/usersController");

router.get("/", getAllUsers);

router.get("/me", getCurrentUser);

router.put("/me/trainer", selectTrainer);

router.get("/:id", getSpecificUser);

router.put("/:id/trainees", setTrainee);

module.exports = router;
