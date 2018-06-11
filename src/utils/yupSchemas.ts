import * as yup from "yup";

import {
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough,
} from "../modules/user/register/errorMessages";
import { missingPasswordKeyError } from "../modules/user/forgotPassword/errorMessages";

export const emailValidation = yup
  .string()
  .min(3, emailNotLongEnough)
  .max(255)
  .email(invalidEmail);

export const passwordValidation = yup
  .string()
  .min(3, passwordNotLongEnough)
  .max(255);

export const newPasswordKeyValidation = yup
  .string()
  .required(missingPasswordKeyError);
