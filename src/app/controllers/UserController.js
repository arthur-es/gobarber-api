import * as Yup from "yup";
import User from "../models/User";

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .min(6)
        .required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: "Yup validation failed when trying to create a new user"
      });
    }

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
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string(),
      password: Yup.string()
        .min(6)
        .when("oldPassword", (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when("password", (password, field) =>
        password ? field.required().oneOf([Yup.ref("password")]) : field
      )
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: "Yup validation failed when trying to update" });
    }

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
