// https://gist.github.com/slavafomin/b164e3e710a6fc9352c934b9073e7216

module.exports = class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.status = status || 500;
  }
};
