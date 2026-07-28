class AlreadyExist extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 409;
  }
}

class InvalidData extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

class ServerError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 500;
  }
}

class NotAuthorized extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
  }
}

module.exports = {
  AlreadyExist,
  InvalidData,
  NotAuthorized,
  NotFoundError,
  ServerError,
};
