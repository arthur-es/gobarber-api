import * as Yup from "yup";
import { isBefore, startOfHour, parseISO, format, subHours } from "date-fns";
import pt from "date-fns/locale/pt";

import Appointment from "../models/Appointment";
import User from "../models/User";
import File from "../models/File";

import Notification from "../schemas/Notification";

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    try {
      const appointments = await Appointment.findAll({
        where: {
          user_id: req.userId,
          canceled_at: null
        },
        order: ["date"],
        attributes: ["id", "date"],
        limit: 20,
        offset: (page - 1) * 20,
        include: [
          {
            model: User,
            as: "provider",
            attributes: ["id", "name"],
            include: [
              { model: File, as: "avatar", attributes: ["id", "path", "url"] }
            ]
          }
        ]
      });
      return res.json(appointments);
    } catch (err) {
      console.log(err);
    }
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: "Yup validation failed when trying to create an appointment"
      });
    }

    const { provider_id, date } = req.body;

    try {
      /**
       * Check if provider_id is a provider
       */
      const isProvider = await User.findOne({
        where: {
          id: provider_id,
          provider: true
        }
      });
      if (!isProvider) {
        return res.status(401).json({ error: "Provide a valid provider_id" });
      }
      /**
       * Check if is not past date
       */
      const hourStart = startOfHour(parseISO(date));

      if (isBefore(hourStart, new Date())) {
        return res.status(400).json({ error: "Past date are not allowed" });
      }

      /**
       * Check date availibility for provider
       */

      const checkAvailibility = await Appointment.findOne({
        where: {
          provider_id,
          canceled_at: null,
          date: hourStart
        }
      });

      if (checkAvailibility) {
        return res
          .status(400)
          .json({ error: "This date is not availible for this provider" });
      }

      const appointment = await Appointment.create({
        user_id: req.userId,
        provider_id,
        date: hourStart
      });

      /**
       * Notify appointment provider
       */
      const formattedDate = format(
        hourStart,
        "'dia' dd 'de' MMMM', às' H:mm'h'",
        { locale: pt }
      );

      const user = await User.findByPk(req.userId);

      await Notification.create({
        content: `Novo agendamento de ${user.name} para ${formattedDate}`,
        user: provider_id
      });

      return res.json(appointment);
    } catch (err) {
      console.log(err);
    }
  }

  async delete(req, res) {
    try {
      const appointment = await Appointment.findByPk(req.params.id);
      if (appointment.user_id !== req.userId) {
        return res.status(400).json({
          error: "You don't have permission to cancel this appointment."
        });
      }

      const dateWithSub = subHours(appointment.date, 2);

      if (isBefore(dateWithSub, new Date())) {
        return res.status(401).json({
          error:
            "Can't cancel without at least 2 hours prior to the appointment time"
        });
      }

      appointment.canceled_at = new Date();
      await appointment.save();

      return res.json(appointment);
    } catch (err) {
      console.log(err);
    }
  }
}

export default new AppointmentController();
