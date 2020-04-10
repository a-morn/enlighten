// https://gist.github.com/slavafomin/b164e3e710a6fc9352c934b9073e7216

export default class AppError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.status = status;
  }
};
