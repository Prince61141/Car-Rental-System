import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text, html, attachments }) => {
  const mailOptions = {
    from: `"Car Rental" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  };
  if (html) mailOptions.html = html;
  if (attachments) mailOptions.attachments = attachments;

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
