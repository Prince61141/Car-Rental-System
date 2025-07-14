import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const otpMap = new Map();

export const generateAndSendOtp = async (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpMap.set(phone, otp);

  await client.messages.create({
    body: `Your AutoConnect OTP is ${otp}`,
    from: process.env.TWILIO_PHONE,
    to: `+91${phone}`,
  });

  return otp;
};

export const verifyOtp = (phone, otp) => {
  const valid = otpMap.get(phone) === otp;
  if (valid) otpMap.delete(phone);
  return valid;
};
