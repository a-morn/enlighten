// https://gist.github.com/slavafomin/b164e3e710a6fc9352c934b9073e7216

import NotFoundError from './not-found';

export default class GameRequestNotFoundError extends NotFoundError {
  constructor(message: string = 'Game request not found') {
    super(message, 404);
  }
};
