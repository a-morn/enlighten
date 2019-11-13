const NotFoundError = require('./errors/not-found');

const errorHandledAction = (res, action) => {
  try {
    action();
  } catch (e) {
    if (e instanceof NotFoundError) {
      res.status(404).send();
    } else {
      res.status(500).send();
    }
  }
};

module.exports = {
  errorHandledAction
};
