import bcrypt from 'bcryptjs';
import prisma from '../configs/db.js';
import { HttpStatus, ApiResponseCode } from '../constants/index.js';
import BaseException from '../exceptions/base.exception.js';
import jwt from 'jsonwebtoken';

const { sign } = jwt;
const { hashSync, compareSync } = bcrypt;

export const RegisterUser = async (req, res) => {
  try {
    const { phone, password, firstName, lastName } = req.body;
    if (!phone && !password) {
      throw new BaseException(
        HttpStatus.BAD_REQUEST,
        ApiResponseCode.INVALID_PARAM,
        'Phone number and password is require!',
      );
    }
    const checkExistUser = await prisma.user.findFirst({
      where: {
        phone: phone,
      },
    });
    if (checkExistUser) {
      throw new BaseException(
        HttpStatus.BAD_REQUEST,
        ApiResponseCode.INVALID_PARAM,
        'Phone number is exist in our system! Try another!',
      );
    }

    // hash password
    const hashPassword = hashSync(password, parseInt(process.env.HASH_SALT));
    await prisma.user.create({
      data: {
        phone: phone,
        password: hashPassword,
        firstName: firstName,
        lastName: lastName,
      },
    });
    return res.status(HttpStatus.OK).send({
      code: ApiResponseCode.SUCCESS,
      message: 'You have registered successfully!',
    });
  } catch (err) {
    if (err instanceof BaseException) {
      return res.status(err.httpStatus).send({
        code: err.apiStatus,
        message: err.message,
      });
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      code: ApiResponseCode.OTHER_ERROR,
      message: err.message,
    });
  }
};

export const LoginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone && !password) {
      throw new BaseException(
        HttpStatus.BAD_REQUEST,
        ApiResponseCode.INVALID_PARAM,
        'Phone number and password is require!',
      );
    }
    // check exist user
    const existUser = await prisma.user.findFirst({
      where: {
        phone: phone,
      },
    });
    if (!existUser) {
      throw new BaseException(
        HttpStatus.BAD_REQUEST,
        ApiResponseCode.INVALID_PARAM,
        'Phone number is not exist in our system! Try another',
      );
    }
    // verify password
    const verify = compareSync(password, existUser.password);
    if (!verify) {
      throw new BaseException(
        HttpStatus.BAD_REQUEST,
        ApiResponseCode.INVALID_PARAM,
        'Invalid password',
      );
    }
    // generate token
    const payload = { id: existUser.id, phone: existUser.phone };
    const accessToken = sign(payload, process.env.TOKEN_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRATION,
    });
    return res.status(HttpStatus.OK).send({
      code: ApiResponseCode.SUCCESS,
      message: 'Login successfully!',
      data: {
        accessToken,
      },
    });
  } catch (err) {
    if (err instanceof BaseException) {
      return res.status(err.httpStatus).send({
        code: err.apiStatus,
        message: err.message,
      });
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      code: ApiResponseCode.OTHER_ERROR,
      message: err.message,
    });
  }
};

export const GetProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },
    });
    if (!user) {
      throw new BaseException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ApiResponseCode.DATABASE_ERROR,
        'User not found in our system!',
      );
    }
    delete user.password;
    return res.status(HttpStatus.OK).send({
      code: ApiResponseCode.SUCCESS,
      message: 'Login successfully!',
      data: {
        ...user,
      },
    });
  } catch (err) {
    if (err instanceof BaseException) {
      return res.status(err.httpStatus).send({
        code: err.apiStatus,
        message: err.message,
      });
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      code: ApiResponseCode.OTHER_ERROR,
      message: err.message,
    });
  }
};
