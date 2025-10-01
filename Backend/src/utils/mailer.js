import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.COLLEGE_EMAIL,
    pass: process.env.COLLEGE_PASS,
  },
});

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  attachments = [],
}) => {
  try {
    const info = await transporter.sendMail({
      from: `"LC-ICEM" <${process.env.COLLEGE_EMAIL}>`,
      to,
      subject,
      text,
      html,
      attachments, // optional, default empty
    });
    console.log("Email sent: ", info.messageId);
    return info;
  } catch (err) {
    console.error("Error sending email: ", err);
    throw err;
  }
};
