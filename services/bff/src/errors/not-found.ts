// https://gist.github.com/slavafomin/b164e3e710a6fc9352c934b9073e7216

import AppError from './app-error';

export default class NotFoundError extends AppError {
  constructor(message: string = 'Not found', statusCode: number = 404) {
    super(message, statusCode);
  }
};
