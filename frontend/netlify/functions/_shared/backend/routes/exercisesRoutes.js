const express = require("express");

const router = express.Router();
const {
  getExercises,
  postExercise,
  deleteExercise,
  completeExercise,
  uncompleteExercise,
} = require("../controllers/exercisesController");

router.get("/", getExercises);

router.post("/", postExercise);

router.delete("/:cardId", deleteExercise);

router.put("/:cardId/completed", completeExercise);

router.delete("/:cardId/completed", uncompleteExercise);

module.exports = router;
