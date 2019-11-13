// https://gist.github.com/slavafomin/b164e3e710a6fc9352c934b9073e7216

const AppError = require('./app-error');

module.exports = class NotFoundError extends AppError {
  constructor(message) {
    super(message || 'Not found', 404);
  }
};
