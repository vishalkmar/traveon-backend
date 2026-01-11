import { decodeToken } from "../utils/jwt";
const { Users, Roles } = require("../models");

export const ensureAuth = (...userType) => {
  return function (req, res, next) {
    if (!req.headers.authorization && userType.includes("Guest")) {
      return next();
    }
    if (!req.headers.authorization) {
      return res.status(403).send({
        status: "error",
        message: "The request does not have an Authentication header.",
      });
    }

    // Remove Bearer from string
    const token = req.headers.authorization.replace(/^Bearer\s+/, "");
    try {
      var payload = decodeToken(token);
      if (payload.expiresIn < Math.floor(new Date().getTime() / 1000)) {
        return res
          .status(401)
          .send({ status: "error", message: "Token Expired" });
      }
    } catch (ex) {
      return res
        .status(401)
        .send({ status: "error", message: "Invalid Token" });
    }

    Users.findOne({
      where: {
        id: payload.id,
        status: "Active",
      },
      include: [{ model: Roles, as: "roleDetails" }],
    })
      .then((user) => {
        if (!user) {
          return res
            .status(404)
            .send({ status: "error", message: "Invalid User" });
        }

        if (
          payload.activeRole === "Admin" ||
          userType.includes(payload.activeRole) ||
          userType.includes("Guest")
        ) {
          req.user = payload;
          req.user.hasAccess = (permissionID) => {
            if (user?.roleDetails?.accessIDs && user?.roleDetails?.accessIDs.split(",").includes(permissionID) ||
                user?.userType === "Admin") {
              return true;
            }
            return false;
          };
          req.permission = req.permission || {};
          req.permission.global = user.userType === "Admin" ? true : false;

          if (
            user?.roleDetails?.accessIDs
              ?.split(",")
              ?.includes(req.module + "-global") &&
            user.userType !== "Admin"
          ) {
            req.permission.global = true;
          }
          return next();
        }
        
        if (user?.roleDetails?.accessIDs && !user.roleDetails.accessIDs.split(",").includes(req.permission.module)) {
          return res
            .status(403)
            .send({ status: "error", message: "Access Denied" });
        }

        if (user?.roleDetails?.accessIDs && user.roleDetails.accessIDs.split(",").includes(req.module + "-global")) {
          req.permission.global = true;
        } else {
          req.permission.global = false;
        }
        req.user = payload;

        req.user.hasAccess = (permissionID) => {
          if (
            user?.roleDetails?.accessIDs && user.roleDetails.accessIDs.split(",").includes(permissionID) ||
            user?.userType === "Admin"
          )
            return true;
          return false;
        };
        return next();
      })
      .catch((err) => {
        console.log(err);
        res
          .status(500)
          .send({ status: "error", message: "Server Error", result: err });
      });
  };
};

export const setModule = (module) => {
  return function (req, res, next) {
    req.module = module;

    switch (req.method) {
      case "GET":
        req.permission = { module: module + "-read" };
        break;

      case "POST":
        req.permission = { module: module + "-write" };
        break;

      case "PUT":
        req.permission = { module: module + "-write" };
        break;

      case "PATCH":
        req.permission = { module: module + "-all" };
        break;

      case "DELETE":
        req.permission = { module: module + "-all" };
        break;
      default:
        break;
    }
    next();
  };
};