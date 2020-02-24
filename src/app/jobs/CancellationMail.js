import Mail from "../../lib/Mail";
import { format, parseISO } from "date-fns";
import pt from "date-fns/locale/pt";

class CancellationMail {
  get key() {
    return "CancellationMail";
  }

  async handle({ data }) {
    console.log("A fila executou.");
    const { appointment } = data;
    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: "Agendamento cancelado",
      template: "cancellation",
      context: {
        provider: appointment.provider.name,
        date: format(
          parseISO(appointment.date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt
          }
        ),
        user: appointment.user.name
      }
    });
  }
}

export default new CancellationMail();
