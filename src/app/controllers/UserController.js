import User from "../models/User";

class UserController {
  async store(req, res) {
    try {
      const userExists = await User.findOne({
        where: { email: req.body.email }
      });
      if (userExists) {
        return res.status(400).json({ error: "User email already exists" });
      }

      const user = await User.create(req.body);

      const { id, name, email, provider } = user;

      return res.json({ id, name, email, provider });
    } catch (err) {
      console.log(err);
    }
  }
}

export default new UserController();
