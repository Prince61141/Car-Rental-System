import {sendOtp} from "./sendOtp.js";

export const generateAndSendOtp = async (phone, otpMap) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpMap.set(phone, otp);
  await sendOtp(phone, otp);
};