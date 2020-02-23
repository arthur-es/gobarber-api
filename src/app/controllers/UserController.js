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

  async update(req, res) {
    const { email, oldPassword } = req.body;

    try {
      const user = await User.findByPk(req.userId);

      if (email && email != user.email) {
        const userExists = await User.findOne({
          where: { email }
        });
        if (userExists) {
          return res.status(400).json({ error: "User email already taken" });
        }
      }

      if (oldPassword && !(await user.checkPassword(oldPassword))) {
        return res.status(401).json({ error: "Old password is wrong" });
      }

      const { id, name, provider } = await user.update(req.body);

      return res.json({ id, name, email, provider });
    } catch (err) {
      console.log(err);
    }
  }
}

export default new UserController();
