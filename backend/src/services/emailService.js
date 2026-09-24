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

    console.log(`Registration OTP email sent successfully to ${email}`);
  } catch (error) {
    console.error("EMAIL ERROR:", error);

    throw new Error("Failed to send OTP email");
  }
};

// ==========================
// SEND PASSWORD RESET OTP
// ==========================

export const sendPasswordResetOtpEmail = async (email, otp) => {
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

    console.log(`Password reset OTP sent successfully to ${email}`);
  } catch (error) {
    console.error("PASSWORD RESET EMAIL ERROR:", error);

    throw new Error("Failed to send password reset OTP email");
  }
};

// ==========================
// SEND ADMIN PASSWORD RESET OTP
// ==========================

export const sendAdminPasswordResetOtpEmail = async (email, name, otp) => {
  try {
    await transporter.sendMail({
      from: {
        name: "UrbanThread Admin",
        address: process.env.EMAIL_USER,
      },

      to: email,

      subject: "UrbanThread Admin Password Reset OTP",

      text: `Hello ${name || "Admin"},

We received a request to reset your UrbanThread admin password.

Your verification code is:

${otp}

This OTP will expire in 10 minutes.

If you did not request this password reset, you can safely ignore this email.

UrbanThread Admin Portal`,

      html: `
        <div style="
          margin: 0;
          padding: 40px 20px;
          background: #111111;
          font-family: Arial, sans-serif;
          color: #ffffff;
        ">
          <div style="
            max-width: 520px;
            margin: 0 auto;
            padding: 35px;
            background: #1b1b1b;
            border: 1px solid #303030;
          ">

            <h1 style="
              margin: 0;
              font-family: Georgia, serif;
              font-size: 28px;
              font-weight: 400;
              color: #f0ece6;
            ">
              UrbanThread
            </h1>

            <p style="
              margin-top: 8px;
              font-size: 11px;
              letter-spacing: 2px;
              color: #888888;
              text-transform: uppercase;
            ">
              Admin Portal
            </p>

            <div style="
              margin-top: 35px;
              border-top: 1px solid #303030;
              padding-top: 30px;
            ">

              <p style="
                font-size: 15px;
                color: #d0d0d0;
              ">
                Hello ${name || "Admin"},
              </p>

              <p style="
                font-size: 14px;
                line-height: 1.7;
                color: #999999;
              ">
                We received a request to reset your
                UrbanThread admin password.
              </p>

              <p style="
                margin-top: 25px;
                font-size: 11px;
                color: #777777;
                text-transform: uppercase;
                letter-spacing: 2px;
              ">
                Your verification code
              </p>

              <div style="
                margin-top: 10px;
                padding: 18px;
                background: #111111;
                border: 1px solid #3a3a3a;
                text-align: center;
              ">
                <span style="
                  font-size: 32px;
                  font-weight: bold;
                  letter-spacing: 10px;
                  color: #e8e5e0;
                ">
                  ${otp}
                </span>
              </div>

              <p style="
                margin-top: 20px;
                font-size: 13px;
                color: #777777;
              ">
                This OTP will expire in
                <strong style="color: #aaaaaa;">
                  10 minutes
                </strong>.
              </p>

              <p style="
                margin-top: 30px;
                font-size: 12px;
                line-height: 1.6;
                color: #666666;
              ">
                If you did not request this password
                reset, you can safely ignore this email.
              </p>

            </div>

            <div style="
              margin-top: 35px;
              padding-top: 20px;
              border-top: 1px solid #303030;
              font-size: 11px;
              color: #555555;
            ">
              UrbanThread Admin Portal
            </div>

          </div>
        </div>
      `,
    });

    console.log(`Admin password reset OTP sent successfully to ${email}`);
  } catch (error) {
    console.error("ADMIN PASSWORD RESET EMAIL ERROR:", error);

    throw new Error("Failed to send admin password reset OTP email");
  }
};

// ==========================
// SEND CHANGE EMAIL OTP
// ==========================

export const sendEmailChangeOtpEmail = async (email, otp) => {
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

    console.log(`Email change OTP sent successfully to ${email}`);
  } catch (error) {
    console.error("EMAIL CHANGE OTP ERROR:", error);

    throw new Error("Failed to send email change OTP");
  }
};
