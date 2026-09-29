import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail", // You can configure this via env variables
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = async (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Registration OTP",
    text: `Your OTP for registration is: ${otp}. It is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to YuktiPrep!</h2>
        <p>Your One-Time Password (OTP) for registration is:</p>
        <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${to}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};
