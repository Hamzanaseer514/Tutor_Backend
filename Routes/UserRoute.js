const express = require("express")
const router = express.Router()
const { registerUser,registerTutor,registerParent, addStudentToParent , loginUser, verifyOtp, resendOtp, addDriver, addAdmin, updateUser, forgotPassword,resetPassword } = require("../Controllers/UserController")
const { protect } = require("../Middleware/authMiddleware")


router.post("/register", registerUser)
router.post("/register-tutor", registerTutor)
router.post("/register-parent", registerParent)
router.post("/add-student-to-parent", protect, addStudentToParent)
router.post("/login", loginUser)
router.post("/verify-otp", verifyOtp)
router.post("/resend-otp", resendOtp)
router.post("/add-admin", addAdmin)
router.put("/update-user/:userId", protect, updateUser)
router.post("/forget-password", forgotPassword)
router.put("/reset-password", resetPassword)



module.exports = router;            