import User from "../models/User";
import File from "../models/File";

class ProviderController {
  async index(req, res) {
    try {
      const providers = await User.findAll({
        where: { provider: true },
        attributes: ["id", "name", "email"],
        include: [
          {
            model: File,
            as: "avatar",
            attributes: ["id", "name", "path", "url"]
          }
        ]
      });
      return res.json(providers);
    } catch (err) {
      console.log(err);
    }
  }
}

export default new ProviderController();
