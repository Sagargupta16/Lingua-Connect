const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Tutor = require("../models/Tutor");
const Student = require("../models/Student");
const logger = require("../utils/logger");
const Otp = require("../models/Otp");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { pickScalars, scalarArray, forLog } = require("../utils/sanitize");

// A student or tutor by email. toString() keeps a non-string body value
// (such as { "$ne": null }) from reaching the query as an operator.
const findAccount = async (email) =>
  (await Student.findOne({ email: email.toString() })) ||
  (await Tutor.findOne({ email: email.toString() }));

exports.postSignup = async (req, res) => {
  try {
    const user = req.body;
    if (
      !user.name ||
      typeof user.email !== "string" ||
      typeof user.password !== "string"
    )
      return res
        .status(400)
        .json({ errors: ["Name, Email and Password required"] });

    const existingUser = await findAccount(user.email);
    if (existingUser)
      return res.status(400).json({
        errors: ["User with the same email already exists"],
      });

    if (
      user.password.length < 6 ||
      !/[a-z]/.test(user.password) ||
      !/[A-Z]/.test(user.password) ||
      !/\d/.test(user.password)
    ) {
      return res.status(401).json({
        errors: [
          "Password must be atleast 6 characters long and contain atleast one uppercase, one lowercase and one numeric character.",
        ],
      });
    }

    if (user.role !== "tutor" && user.role !== "student")
      return res.status(400).json({ errors: ["Invalid role"] });

    const hashedPassword = await bcrypt.hash(
      user.password,
      Number(process.env.JWT_SALT_ROUNDS),
    );
    // Build the account from named fields only, so signup cannot set
    // rating, classes, slots or any other server-owned field.
    const account = {
      ...pickScalars(user, ["name", "email", "role"]),
      password: hashedPassword,
    };

    if (user.role === "tutor") {
      if (!Array.isArray(user.languages) || user.languages.length === 0) {
        return res
          .status(400)
          .json({ errors: ["Atleast 1 language required"] });
      }
      if (!(Number(user.yearsOfExperience) >= 0)) {
        return res
          .status(400)
          .json({ errors: ["Years of experience must be greater than 0"] });
      }
      account.languages = scalarArray(user.languages);
      account.yearsOfExperience = Number(user.yearsOfExperience);
      await new Tutor(account).save();
    } else {
      await new Student(account).save();
    }
    logger.info(`New user created: ${forLog(user.email)}`);
    res.status(201).json({
      messages: ["User created successfully"],
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.getLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ status: false, errors: ["Email and Password required"] });

    const user = await findAccount(email);
    if (!user)
      return res
        .status(401)
        .json({ status: false, errors: ["User Not Found"] });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res
        .status(401)
        .json({ status: false, errors: ["Incorrect Password"] });

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    logger.info(`User logged in: ${forLog(email)}`);
    res.json({ status: true, data: { token }, messages: ["Login Successful"] });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: false, errors: ["Internal server error"] });
  }
};

// postVerifyEmail with OTP
exports.postVerifyEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Generate a secure OTP
    const otp = crypto.randomInt(100000, 999999);

    // Rest of the code remains unchanged
    if (!email)
      return res
        .status(400)
        .json({ status: false, errors: ["Email required"] });

    const user = await findAccount(email);
    if (!user)
      return res
        .status(401)
        .json({ status: false, errors: ["User Not Found"] });

    const existingOtp = await Otp.findOne({ email: email.toString() });
    if (existingOtp) await Otp.findByIdAndDelete(existingOtp._id);

    await new Otp({ email, otp }).save();

    logger.info(`OTP generated for ${forLog(email)}`);

    // Create a nodemailer transporter
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD,
      },
      secure: true,
    });

    // Define email options
    let mailOptions = {
      from: `"Lingua Connect" <${process.env.EMAIL_ID}>`,
      to: email,
      subject: "OTP for Verification",
      text: `Your OTP is: ${otp} use it to verify your account within 10 minutes.`,
    };

    // Send email
    let info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);

    res.status(200).json({
      status: true,
      messages: [`OTP sent to ${email}`],
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: false, errors: ["Internal server error"] });
  }
};

// postVerifyOTP
exports.postVerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (typeof email !== "string" || !otp)
      return res
        .status(400)
        .json({ status: false, errors: ["Email and OTP required"] });

    const user = await findAccount(email);
    if (!user)
      return res
        .status(401)
        .json({ status: false, errors: ["User Not Found"] });

    const existingOtp = await Otp.findOne({ email: email.toString() });
    if (!existingOtp)
      return res
        .status(401)
        .json({ status: false, errors: ["OTP not generated"] });
    if (existingOtp.otp !== String(otp))
      return res.status(401).json({ status: false, errors: ["Incorrect OTP"] });

    // Check OTP expiry
    const otpExpiry = new Date(existingOtp.createdAt).getTime() + 600000;
    const currentTime = new Date().getTime();
    if (currentTime > otpExpiry)
      return res.status(401).json({ status: false, errors: ["OTP expired"] });

    logger.info(`User verified: ${forLog(email)}`);

    res.status(200).json({
      status: true,
      messages: ["Email verified successfully"],
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: false, errors: ["Internal server error"] });
  }
};

// postResetPassword
exports.postResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (typeof email !== "string" || typeof newPassword !== "string")
      return res
        .status(400)
        .json({ status: false, errors: ["Email and Password required"] });

    const user = await findAccount(email);
    if (!user)
      return res
        .status(401)
        .json({ status: false, errors: ["User Not Found"] });

    const existing = await Otp.findOne({ email: email.toString() });
    if (!existing)
      return res
        .status(401)
        .json({ status: false, errors: ["OTP not generated"] });

    if (existing.otp !== String(otp))
      return res.status(401).json({ status: false, errors: ["Incorrect OTP"] });

    if (
      newPassword.length < 6 ||
      !/[a-z]/.test(newPassword) ||
      !/[A-Z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    )
      return res.status(401).json({
        status: false,
        errors: [
          "Password must be atleast 6 characters long and contain atleast one uppercase, one lowercase and one numeric character.",
        ],
      });

    // Check OTP expiry
    const otpExpiry = new Date(existing.createdAt).getTime() + 600000;
    const currentTime = new Date().getTime();
    if (currentTime > otpExpiry)
      return res.status(401).json({ status: false, errors: ["OTP expired"] });

    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(process.env.JWT_SALT_ROUNDS),
    );
    user.password = hashedPassword;
    await user.save();

    await Otp.findByIdAndDelete(existing._id);

    logger.info(`Password reset for ${forLog(email)}`);

    res.status(200).json({
      status: true,
      messages: ["Password reset successfully"],
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: false, errors: ["Internal server error"] });
  }
};
