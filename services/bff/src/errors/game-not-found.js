// https://gist.github.com/slavafomin/b164e3e710a6fc9352c934b9073e7216

const NotFoundError = require('./not-found');

module.exports = class GameNotFoundError extends NotFoundError {
  constructor(message) {
    super(message || 'Game not found', 404);
  }
};
