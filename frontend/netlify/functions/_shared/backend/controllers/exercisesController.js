const Exercise = require("../models/exerciseModel");
const error = require("../errors/errors");
const NotFoundError = error.NotFoundError;

function onOrFail() {
  throw new NotFoundError("No se ha encontrado ninguna tarjeta");
}

module.exports.getExercises = (req, res, next) => {
  Exercise.find({})
    .orFail(onOrFail)
    .then((data) => {
      res.send({ status: true, data });
    })
    .catch(next);
};

module.exports.postExercise = (req, res, next) => {
  Exercise.create({
    exercise: req.body.exercise,
    description: req.body.description,
    owner: req.body.owner,
  })
    .then((card) => {
      res.send({ data: card });
    })
    .catch(next);
};

module.exports.deleteExercise = (req, res, next) => {
  const { cardId } = req.params;
  Exercise.findByIdAndDelete({ _id: cardId })
    .orFail(onOrFail)
    .then((data) => {
      res.send({ status: true, data });
    })
    .catch(next);
};

module.exports.completeExercise = (req, res, next) => {
  Exercise.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { completed: req.user._id } },
    { new: true }
  )
    .orFail(onOrFail)
    .then((data) => {
      res.send({ status: true, data });
    })
    .catch(next);
};

module.exports.uncompleteExercise = (req, res, next) => {
  Exercise.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { completed: req.user._id } },
    { new: true }
  )
    .orFail(onOrFail)
    .then((data) => {
      res.send({ status: true, data });
    })
    .catch(next);
};
