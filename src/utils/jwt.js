import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "jktyagi";

export function parseJwt(token) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}

// Function to Create Token

export function createAccessToken(user) {
 
  const EXPIRE_IN = Math.floor(new Date().getTime() / 1000) + 24 * 24 * 60 * 60;
  return jwt.sign(
    {
      id: user.id,
      userId: user.userId,
      emailAddress: user.emailAddress,
      userType: user.userType,
      activeRole: user.activeRole,
      expiresIn: EXPIRE_IN,
      currentOrganizationId:user.currentOrgId
    },
    SECRET_KEY
  ); // DO NOT KEEP YOUR SECRET IN THE CODE!
}

// Function To create Refresh Token
// export const createRefreshToken = function(user) {
//   const payload = {
//     id: user._id,
//     exp: EXPIRE_IN
//   };
//   return jwt.encode(payload, SECRET_KEY);
// };

// Function To Decode Token
export function decodeToken(token) {
  return jwt.verify(token, SECRET_KEY);
}
