import mongoose from "mongoose";
import User from "../models/User";
import Notification from "../schemas/Notification";

class NotificationController {
  async index(req, res) {
    /**
     * Check if user is provider
     */
    const isProvider = await User.findOne({
      where: {
        id: req.userId,
        provider: true
      }
    });

    if (!isProvider) {
      return res
        .status(400)
        .json({ error: "Only providers can load notifications" });
    }

    const notifications = await Notification.find({
      user: req.userId
    })
      .sort({ createdAt: "desc" })
      .limit(20);

    return res.json(notifications);
  }
}

export default new NotificationController();
