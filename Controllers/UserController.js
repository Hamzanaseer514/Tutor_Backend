const asyncHandler = require("express-async-handler");
const User = require("../Models/userSchema");
const Student = require("../Models/studentProfileSchema");
const TutorProfile = require("../Models/tutorProfileSchema");
const TutorApplication = require("../Models/tutorApplicationSchema");
const TutorDocument = require("../Models/tutorDocumentSchema");
const ParentProfile = require("../Models/ParentProfileSchema");
const { generateAccessToken, generateRefreshToken } = require("../Utils/generateTokens");
const sendEmail = require("../Utils/sendEmail");
const otpStore = require("../Utils/otpStore");
const generateOtpEmail = require("../Utils/otpTempelate");


exports.registerUser = asyncHandler(async (req, res) => {
  const {
    full_name,
    email,
    password,
    age,
    role,
    photo_url,
    academic_level,
    learning_goals,
    preferred_subjects,
    availability,
  } = req.body;

  if (
    !email || !password || !age || !full_name ||
    !academic_level || !learning_goals || !preferred_subjects || !availability
  ) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error("Email already exists");
  }

  const session = await User.startSession();
  session.startTransaction();

  try {
    // Create user with password (hashing will happen in model)
    const user = await User.create(
      [
        {
          full_name,
          email,
          password, // will be hashed by pre-save hook
          age,
          role: role || "student",
          photo_url,
          is_verified: true // Assuming auto-verification for registration
        },
      ],
      { session }
    );

    // Create student profile
    const student = await Student.create(
      [
        {
          user_id: user[0]._id,
          academic_level,
          learning_goals,
          preferred_subjects,
          availability
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Student registered successfully",
      _id: user[0]._id,
      full_name: user[0].full_name,
      email: user[0].email,
      role: user[0].role,
      age: user[0].age,
      photo_url: user[0].photo_url,
      studentData: student[0]
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500);
    throw new Error("User/Student creation failed: " + error.message);
  }
});




exports.registerTutor = asyncHandler(async (req, res) => {
  const {
    full_name,
    email,
    password,
    age,
    photo_url,
    qualifications,
    experience_years,
    subjects, // array of subjects
    bio,
    code_of_conduct_agreed
  } = req.body;

  if (!email || !password || !age || !full_name || !qualifications || !subjects || !experience_years || code_of_conduct_agreed === undefined) {
    res.status(400);
    throw new Error("All required fields must be provided");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("Email already exists");
  }

  const session = await User.startSession();
  session.startTransaction();

  try {
    // Step 1: Create user
    const user = await User.create(
      [{
        full_name,
        email,
        password,
        age,
        role: "tutor",
        photo_url,
        is_verified: false // Not verified yet
      }],
      { session }
    );

    // Step 2: Create tutor profile
    const tutorProfile = await TutorProfile.create(
      [{
        user_id: user[0]._id,
        bio: bio || '',
        qualifications,
        experience_years,
        subjects
      }],
      { session }
    );

    // Step 3: Create tutor application entry
    const tutorApplication = await TutorApplication.create(
      [{
        user_id: user[0]._id,
        interview_status: 'Pending',
        code_of_conduct_agreed: code_of_conduct_agreed,
        application_status: 'Pending'
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Tutor registered successfully",
      user: {
        _id: user[0]._id,
        full_name: user[0].full_name,
        email: user[0].email,
        role: user[0].role,
        age: user[0].age,
        photo_url: user[0].photo_url
      },
      profile: tutorProfile[0],
      application: tutorApplication[0]
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500);
    throw new Error("Tutor registration failed: " + error.message);
  }
});


exports.registerParent = asyncHandler(async (req, res) => {
  const {
    full_name,
    email,
    password,
    age,
    photo_url
  } = req.body;

  if (!email || !password || !full_name) {
    res.status(400);
    throw new Error("Full name, email, and password are required");
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error("Email already exists");
  }

  const session = await User.startSession();
  session.startTransaction();

  try {
    const user = await User.create(
      [{
        full_name,
        email,
        password,
        age,
        role: "parent",
        photo_url,
        is_verified: true
      }],
      { session }
    );

    const parent = await ParentProfile.create(
      [{
        user_id: user[0]._id,
        students: [] // start with empty student array
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Parent registered successfully",
      _id: user[0]._id,
      full_name: user[0].full_name,
      email: user[0].email,
      role: user[0].role,
      age: user[0].age,
      photo_url: user[0].photo_url,
      parentProfile: parent[0]
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500);
    throw new Error("Parent creation failed: " + error.message);
  }
});


exports.addStudentToParent = asyncHandler(async (req, res) => {
  const {
    parent_user_id, // user._id of parent
    full_name,
    email,
    password,
    age,
    photo_url,
    academic_level,
    learning_goals,
    preferred_subjects,
    availability
  } = req.body;

  if (!parent_user_id || !email || !password || !full_name || !academic_level || !learning_goals || !preferred_subjects || !availability) {
    res.status(400);
    throw new Error("Missing required student fields");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("Student email already exists");
  }

  const session = await User.startSession();
  session.startTransaction();

  try {
    const studentUser = await User.create(
      [{
        full_name,
        email,
        password,
        age,
        role: "student",
        photo_url,
        is_verified: true
      }],
      { session }
    );

    const studentProfile = await Student.create(
      [{
        user_id: studentUser[0]._id,
        academic_level,
        learning_goals,
        preferred_subjects,
        availability
      }],
      { session }
    );

    const parentProfile = await ParentProfile.findOneAndUpdate(
      { user_id: parent_user_id },
      { $push: { students: studentProfile[0] } }, // push whole object or just ref
      { new: true, session }
    );

    if (!parentProfile) {
      throw new Error("Parent profile not found");
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Student added to parent successfully",
      studentUser: studentUser[0],
      studentProfile: studentProfile[0],
      parentProfile
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500);
    throw new Error("Failed to add student: " + error.message);
  }
});




exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  if (!user.is_verified) {
    res.status(403);
    throw new Error("User not verified. please be Patient, Admin will verify you soon");
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[user._id] = {
    otp,
    expiresAt: Date.now() + 60000,
    attempts: 1,
    maxAttempts: 5,
    lockUntil: null
  };
  const htmlContent = generateOtpEmail(otp, user.username);
  await sendEmail(user.email, "Your SaferSavvy OTP Code", htmlContent);
  res.status(200).json({
    message: "OTP sent to your email",
    userId: user._id,
    email: user.email,
  });
});


exports.verifyOtp = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;
  console.log("Verifying OTP for user:", req.body);
  const entry = otpStore[userId];

  if (!entry) {
    return res.status(400).json({ message: "No OTP request found" });
  }

  if (entry.lockUntil && Date.now() < entry.lockUntil) {
    return res.status(429).json({ message: "Too many attempts. Try after 30 minutes." });
  }

  if (Date.now() > entry.expiresAt) {
    return res.status(400).json({ message: "OTP expired. Please regenerate." });
  }

  if (otp !== entry.otp) {
    entry.attempts++;
    if (entry.attempts >= entry.maxAttempts) {
      entry.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes lock
      return res.status(429).json({ message: "Too many wrong attempts. Try after 30 minutes." });
    }
    return res.status(401).json({ message: "Incorrect OTP" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // // ✅ Case 1: Forgot Password
  // if (entry.purpose === "forgotPassword") {
  //   delete otpStore[userId];
  //   return res.status(200).json({
  //     message: "OTP verified successfully. You can now reset your password.",
  //     userId
  //   });
  // }

  // ✅ Case 2: Login
  let roleData = null;

  if (user.role === "student") {
    roleData = await Student.findOne({ user: user._id }).select("-__v -createdAt -updatedAt");
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  delete otpStore[userId];

  res.status(200).json({
    message: "Login successful",
    user: {
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      address: user.address,
      gender: user.gender
    },
    data: roleData,
    accessToken,
  });
});



exports.resendOtp = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const entry = otpStore[userId];

  if (!entry) {
    return res.status(400).json({ message: "OTP not requested yet" });
  }

  if (entry.lockUntil && Date.now() < entry.lockUntil) {
    return res.status(429).json({ message: "Too many attempts. Try after 30 minutes." });
  }

  if (entry.attempts >= entry.maxAttempts) {
    entry.lockUntil = Date.now() + 30 * 60 * 1000;
    return res.status(429).json({ message: "OTP resend limit reached. Try after 30 minutes." });
  }

  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[userId] = {
    otp: newOtp,
    expiresAt: Date.now() + 60000,
    attempts: entry.attempts + 1,
    maxAttempts: entry.maxAttempts,
    lockUntil: entry.lockUntil || null,
  };

  const user = await User.findById(userId);
  const htmlContent = generateOtpEmail(newOtp, user.username);
  await sendEmail(user.email, "Your SaferSavvy OTP Code", htmlContent);

  res.status(200).json({ message: "New OTP sent to your email." });
});





exports.addAdmin = asyncHandler(async (req, res) => {
  console.log("Adding admin with data:", req.body);
  const { full_name, email, password } = req.body;

  if (!email || !password || !full_name) {
    res.status(400);
    throw new Error("All fields are required");
  }
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error("Email already exists");
  }

  const session = await User.startSession();
  session.startTransaction();

  try {
    const user = await User.create(
      [
        {
          full_name,
          email,
          password,
          role: "admin"
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: `Admin ${user[0].full_name} added successfully`,
      _id: user[0]._id,
      full_name: user[0].full_name,
      email: user[0].email,
      role: user[0].role
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500);
    throw new Error("Admin creation failed: " + error.message);
  }
});




// UPDATE USER...

exports.updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const {
    full_name,
    phone_number,
    address,
    gender,
    department,
    licence_no,
    experience,
    cnic,
    is_verified,
    profile_picture,
    joining_date
  } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (full_name) user.full_name = full_name;
  if (phone_number) user.phone_number = phone_number;
  if (address) user.address = address;
  if (gender) user.gender = gender;
  if (is_verified !== undefined) user.is_verified = is_verified;
  if (profile_picture) user.profile_picture = profile_picture;

  await user.save();

  let roleData;

  if (user.role === "student") {
    const student = await Student.findOne({ user: userId });
    if (!student) throw new Error("Student record not found");
    if (department) student.department = department;

    await student.save();
    roleData = student;

  } else if (user.role === "driver") {
    const driver = await Driver.findOne({ user: userId });
    if (!driver) throw new Error("Driver record not found");

    if (licence_no) driver.licence_no = licence_no;
    if (experience) driver.experience = experience;
    if (cnic) driver.cnic = cnic;
    if (joining_date) driver.joining_date = joining_date;

    await driver.save();
    roleData = driver;

  } else if (user.role === "transportAdmin") {
    const admin = await TransportAdmin.findOne({ user: userId });
    if (!admin) throw new Error("TransportAdmin record not found");

    roleData = admin;
  }

  res.status(200).json({
    message: "User updated successfully",
    user: {
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      address: user.address,
      gender: user.gender,
    },
    roleData,
  });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("No user found with this email");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[user._id] = {
    otp,
    expiresAt: Date.now() + 60000,
    attempts: 1,
    maxAttempts: 5,
    lockUntil: null,
    purpose: "forgotPassword"
  };

  const htmlContent = generateOtpEmail(otp, user.full_name || user.username || "User");
  await sendEmail(user.email, "Reset Your Password - OTP", htmlContent);

  res.status(200).json({
    message: "OTP sent to your email for password reset",

  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { userId, newPassword } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
});
