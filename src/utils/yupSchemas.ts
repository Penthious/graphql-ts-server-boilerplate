import * as yup from "yup";

import {
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough,
  passwordRequired,
  emailRequired,
} from "../modules/user/register/errorMessages";
import { missingPasswordKeyError } from "../modules/user/forgotPassword/errorMessages";

export const emailValidation = yup
  .string()
  .min(3, emailNotLongEnough)
  .max(255)
  .email(invalidEmail)
  .required(emailRequired);

export const passwordValidation = yup
  .string()
  .min(3, passwordNotLongEnough)
  .max(255)
  .required(passwordRequired);

export const newPasswordKeyValidation = yup
  .string()
  .required(missingPasswordKeyError);
