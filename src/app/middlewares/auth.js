import jwt from "jsonwebtoken";
import authConfig from "../../config/auth";

import { promisify } from "util";

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "Token must be provided" });
  console.log(authHeader);

  const [, token] = authHeader.split(" ");

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    const { id } = decoded;
    req.userId = id;

    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
