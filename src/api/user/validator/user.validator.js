const Joi = require('joi');

const signUp = {
  body: Joi.object().keys({
    fullName: Joi.string().required().label("Full name"),
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().min(6).required().label("Password").messages({
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password must be at least 6 characters long'
    }),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().min(6).required().label("Password").messages({
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password must be at least 6 characters long'
    }),
  }),
};

const verifyEmail = {
  body: Joi.object().keys({
    otp: Joi.string().required()
  })
};

const changePassword = {
  body: Joi.object().keys({
    oldPassword: Joi.string().min(6).required().messages({
      'string.min': 'Old password must be at least 6 characters long',
      'string.empty': 'Old password is required',
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.min': 'New password must be at least 6 characters long',
      'string.empty': 'New password is required',
    }),
    confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'Confirm new password must match new password',
      'string.empty': 'Confirm new password is required',
    }),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.string().required(),
    newPassword: Joi.string().min(6).required().label("New Password").messages({
      'string.empty': 'New Password cannot be empty',
      'string.min': 'New Password must be at least 6 characters long'
    }),
  }),
};

const verifyResetPassOTP = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.string().required(),
  }),
};

module.exports = {
  signUp,
  login,
  verifyEmail,
  resetPassword,
  changePassword,
  verifyResetPassOTP
};
