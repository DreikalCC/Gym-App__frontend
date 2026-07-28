const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    minlength: 2,
    maxlength: 30,
    default: "Jacques",
  },
  lastname: {
    type: String,
    required: false,
    minlength: 2,
    maxlength: 30,
    default: "Cousteau",
  },
  role: {
    type: String,
    required: false,
    minlength: 2,
    maxlength: 30,
    default: "Trainee",
  },
  email: {
    type: String,
    required: [true, "Email requerido"],
    unique: true,
    validate: (value) =>
      validator.isEmail(value, {
        allow_display_name: false,
        require_display_name: false,
        allow_utf8_local_part: true,
        require_tld: true,
        allow_ip_domain: false,
        domain_specific_validation: false,
        blacklisted_chars: "",
        host_blacklist: [],
      }),
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    validate: (value) =>
      validator.isStrongPassword(value, {
        minLength: 6,
        minLowercase: 1,
        minUppercase: 0,
        minNumbers: 1,
        minSymbols: 0,
        returnScore: false,
        pointsPerUnique: 1,
        pointsPerRepeat: 1,
        pointsForContainingLower: 10,
        pointsForContainingUpper: 10,
        pointsForContainingNumber: 10,
        pointsForContainingSymbol: 10,
      }),
    select: false,
  },
  trainees: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: "user",
  },
  trainer: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: "user",
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email,
  password
) {
  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error("Email o password incorrecto"));
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(new Error("Email o password incorrecto"));
        }
        return user;
      });
    });
};

module.exports = mongoose.model("user", userSchema);
