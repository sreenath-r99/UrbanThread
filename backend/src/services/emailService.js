import nodemailer from "nodemailer";

// ==========================
// EMAIL TRANSPORTER
// ==========================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ==========================
// SEND REGISTRATION OTP EMAIL
// ==========================

export const sendOtpEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: {
        name: "UrbanThread",
        address: process.env.EMAIL_USER,
      },

      to: email,

      subject: "Your UrbanThread Verification Code",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 30px;
          background-color: #f7f7f7;
        ">
          <div style="
            background-color: #ffffff;
            padding: 30px;
            text-align: center;
            border-radius: 8px;
          ">
            <h1 style="
              color: #222222;
              margin-bottom: 20px;
            ">
              URBANTHREAD
            </h1>

            <h2>Email Verification</h2>

            <p>
              Thank you for creating an UrbanThread account.
            </p>

            <p>
              Use the following OTP to verify your email address:
            </p>

            <div style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 25px 0;
              padding: 15px;
              background-color: #f1f1f1;
            ">
              ${otp}
            </div>

            <p style="
              color: #777777;
              font-size: 14px;
            ">
              This OTP will expire in 10 minutes.
            </p>
          </div>
        </div>
      `,
    });

    console.log(
      `Registration OTP email sent successfully to ${email}`
    );
  } catch (error) {
    console.error("EMAIL ERROR:", error);

    throw new Error("Failed to send OTP email");
  }
};

// ==========================
// SEND PASSWORD RESET OTP
// ==========================

export const sendPasswordResetOtpEmail = async (
  email,
  otp
) => {
  try {
    await transporter.sendMail({
      from: {
        name: "UrbanThread",
        address: process.env.EMAIL_USER,
      },

      to: email,

      subject: "Your UrbanThread Password Reset Code",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 30px;
          background-color: #f7f7f7;
        ">
          <div style="
            background-color: #ffffff;
            padding: 30px;
            text-align: center;
            border-radius: 8px;
          ">
            <h1 style="
              color: #222222;
              margin-bottom: 20px;
            ">
              URBANTHREAD
            </h1>

            <h2>Password Reset</h2>

            <p>
              We received a request to reset your password.
            </p>

            <p>
              Use the following OTP to continue:
            </p>

            <div style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 25px 0;
              padding: 15px;
              background-color: #f1f1f1;
            ">
              ${otp}
            </div>

            <p style="
              color: #777777;
              font-size: 14px;
            ">
              This OTP will expire in 10 minutes.
            </p>

            <p style="
              color: #777777;
              font-size: 12px;
              margin-top: 25px;
            ">
              If you did not request a password reset,
              please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    console.log(
      `Password reset OTP sent successfully to ${email}`
    );
  } catch (error) {
    console.error("PASSWORD RESET EMAIL ERROR:", error);

    throw new Error(
      "Failed to send password reset OTP email"
    );
  }
};

// ==========================
// SEND CHANGE EMAIL OTP
// ==========================

export const sendEmailChangeOtpEmail = async (
  email,
  otp
) => {
  try {
    await transporter.sendMail({
      from: {
        name: "UrbanThread",
        address: process.env.EMAIL_USER,
      },

      to: email,

      subject: "Your UrbanThread Email Change Verification Code",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 30px;
          background-color: #f7f7f7;
        ">
          <div style="
            background-color: #ffffff;
            padding: 30px;
            text-align: center;
            border-radius: 8px;
          ">
            <h1 style="
              color: #222222;
              margin-bottom: 20px;
            ">
              URBANTHREAD
            </h1>

            <h2>Change Email Verification</h2>

            <p>
              We received a request to change the email address
              associated with your UrbanThread account.
            </p>

            <p>
              Use the following OTP to verify your new email address:
            </p>

            <div style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 25px 0;
              padding: 15px;
              background-color: #f1f1f1;
            ">
              ${otp}
            </div>

            <p style="
              color: #777777;
              font-size: 14px;
            ">
              This OTP will expire in 10 minutes.
            </p>

            <p style="
              color: #777777;
              font-size: 12px;
              margin-top: 25px;
            ">
              If you did not request this email change,
              please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    console.log(
      `Email change OTP sent successfully to ${email}`
    );
  } catch (error) {
    console.error("EMAIL CHANGE OTP ERROR:", error);

    throw new Error(
      "Failed to send email change OTP"
    );
  }
};