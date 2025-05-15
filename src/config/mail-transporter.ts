import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

var transporter: nodemailer.Transporter;
if (process.env.MAIL_ENV === "local") {
  transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAILTRAP_PORT),
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });
} else {
  transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export default transporter;
