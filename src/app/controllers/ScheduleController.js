import { startOfDay, endOfDay, parseISO } from "date-fns";
import { Op } from "sequelize";

import Appointment from "../models/Appointment";
import User from "../models/User";
import File from "../models/File";

class ScheduleController {
  async index(req, res) {
    const { page = 1 } = req.query;
    try {
      /**
       * Check if logged user is a provider
       */
      const isProvider = await User.findOne({
        where: {
          id: req.userId,
          provider: true
        }
      });

      if (!isProvider) {
        return res.status(400).json({ error: "This user is not a provider" });
      }

      const { date } = req.query;
      const parsedDate = parseISO(date);

      const appointments = await Appointment.findAll({
        where: {
          provider_id: req.userId,
          canceled_at: null,
          date: {
            [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)]
          }
        },
        order: ["date"]
      });

      return res.json(appointments);
    } catch (err) {
      console.log(err);
    }
  }
}

export default new ScheduleController();
