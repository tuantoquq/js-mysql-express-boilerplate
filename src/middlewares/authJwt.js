import jwt from 'jsonwebtoken';
import { HttpStatus, ApiResponseCode } from '../constants/index.js';

const { verify, TokenExpiredError } = jwt;

const CatchExpiredTokenError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(HttpStatus.UNAUTHORIZED).send({
      code: ApiResponseCode.AUTH_ERROR,
      message: 'Unauthorized! Token was expired',
    });
  }
  return res.status(HttpStatus.UNAUTHORIZED).send({
    code: ApiResponseCode.AUTH_ERROR,
    message: 'Unauthorized! Invalid token',
  });
};

export const verifyToken = async (req, res, next) => {
  let bearerToken = req.headers.authorization;
  if (bearerToken !== undefined && bearerToken.startsWith('Bearer ')) {
    let token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(HttpStatus.FORBIDDEN).send({
        code: ApiResponseCode.AUTH_ERROR,
        message: 'No token provide!',
      });
    }

    verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return CatchExpiredTokenError(err, res);
      }
      req.userId = decoded.id;
      next();
    });
  } else {
    return res.status(HttpStatus.FORBIDDEN).send({
      code: ApiResponseCode.AUTH_ERROR,
      message: 'Invalid token provide!',
    });
  }
};
