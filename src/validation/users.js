import { Users } from "../models";
import PasswordHashing from "../utils/password-hashing";

export const userValidation = {
  firstName: {
    exists: {
      errorMessage: "First Name is required.",
    },
    isLength: {
      errorMessage: "First Name is required.",
      options: { min: 1 },
    },
  },
  lastName: {
    exists: {
      errorMessage: "Last Name is required.",
    },
    isLength: {
      errorMessage: "Last Name is required.",
      options: { min: 1 },
    },
  },

  userPassword: {
    exists: {
      errorMessage: "Password is required.",
    },
    isLength: {
      errorMessage: "Password should be at least 7 chars long",
      options: { min: 7 },
    },
    // custom: {
    //   options: (value, { req }) => {
    //     if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
    //       throw new Error(
    //         "Password must contain at least one uppercase letter, one lowercase letter, and one digit"
    //       );
    //     }
    //     return true;
    //   },
    // },
  },
};

export const userEditValidation = {
  firstName: {
    exists: {
      errorMessage: "First Name is required.",
    },
    isLength: {
      errorMessage: "First Name is required.",
      options: { min: 1 },
    },
  },
  lastName: {
    exists: {
      errorMessage: "Last Name is required.",
    },
    isLength: {
      errorMessage: "Last Name is required.",
      options: { min: 1 },
    },
  },
  phoneNumber: {
    exists: {
      errorMessage: "Phone Number is required.",
    },
    isInt: {
      errorMessage: "Phone Number is not a valid Phone Number",
    },
  },
  // status: {
  //   matches: {
  //     options: [/\b(?:Active|Inactive|Deleted)\b/],
  //     errorMessage: "Invalid Status"
  //   }
  // }
};

export const userLoginValidation = {
  // email: {
  //   exists: {
  //     errorMessage: "Email is required.",
  //   },
  //   isEmail: {
  //     bail: true,
  //     errorMessage: "Email is not a valid email.",
  //   },
  // },
  password: {
    exists: {
      errorMessage: "Password is required.",
    },
    // isLength: {
    //   errorMessage: "Password should be at least 7 chars long",
    //   options: { min: 7 },
    // },
  },
};

export const changeStatusValidation = {
  status: {
    isLength: {
      errorMessage: "Status is required.",
      options: { min: 1 },
    },
  },
};

export const verifyStatusValidation = {
  status: {
    isLength: {
      errorMessage: "Status is required.",
      options: { min: 1 },
    },
  },
};

export const otpValidation = {
  email: {
    isEmail: {
      bail: true,
      errorMessage: "Email is not a valid email.",
    },
    custom: {
      options: (value, { req, location, path }) => {
        return Users.findOne({
          where: {
            emailAddress: value,
            status: "Active",
          },
        }).then((user) => {
          if (!user) {
            return Promise.reject("E-mail is not registered");
          }
        });
      },
    },
  },
};

export const verifyOtpValidation = {
  email: {
    isEmail: {
      bail: true,
      errorMessage: "Email is not a valid email.",
    },
  },
  otp: {
    isInt: {
      errorMessage: "OTP is not Valid",
    },
  },
};

export const changePassword = {
  currentPassword: {
    custom: {
      options: (value, { req, location, path }) => {
        if (!value) return Promise.reject("Current Password is required");
        return Users.findOne({
          where: {
            id: req.user.id,
          },
        }).then(async (user) => {
          const checked = await PasswordHashing.comparePassword(
            value,
            user.userPassword
          );
          console.log("checked", checked);
          if (!checked) {
            return Promise.reject("Current Password is Incorrect");
          }
        });
      },
    },
  },
  newPassword: {
    isLength: {
      errorMessage: "Password should be at least 7 chars long",
      options: { min: 7 },
    },
    custom: {
      options: (value, { req }) => {
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          throw new Error(
            "Password must contain at least one uppercase letter, one lowercase letter, and one digit"
          );
        }
        return true;
      },
    },
  },
};

export const forgetPassword = {
  otp: {
    isInt: {
      errorMessage: "OTP is not Valid",
    },
  },
  newPassword: {
    isLength: {
      errorMessage: "Password should be at least 7 chars long",
      options: { min: 7 },
    },
    custom: {
      options: (value, { req }) => {
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          throw new Error(
            "Password must contain at least one uppercase letter, one lowercase letter, and one digit"
          );
        }
        return true;
      },
    },
  },
};
