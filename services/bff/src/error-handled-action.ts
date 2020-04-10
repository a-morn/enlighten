import NotFoundError from './errors/not-found'
import { Response } from 'express';

const errorHandledAction = (res: Response, action: () => unknown) => {
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

export {
  errorHandledAction
};
