import jwt from "jsonwebtoken";
import User from "../models/User";

import authConfig from "../../config/auth";

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: "User email not found" });
      }

      if (!(await user.checkPassword(password))) {
        return res.status(401).json({ error: "Wrong password" });
      }

      const { id, name } = user;

      return res.status(200).json({
        user: {
          id,
          name,
          email
        },
        token: jwt.sign({ id }, authConfig.secret, {
          expiresIn: authConfig.expiresIn
        })
      });
    } catch (err) {
      console.log(err);
    }
  }
}

export default new SessionController();
