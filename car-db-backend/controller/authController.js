import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import OTPGenerator from "otp-generator";
import { sendOTPEmail, sendPasswordResetEmail } from "../services/emailTemplates.js";

// ==================== REGISTER WITH OTP ====================
/**
 * Send OTP for email verification during registration
 * Can be used for both registration (POST /api/auth/register) 
 * and resending OTP for unverified users (POST /api/auth/send-otp)
 * @route POST /api/auth/register or POST /api/auth/send-otp
 */
export const sendOTP = async (req, res) => {
  // Email can come from request body or from decoded JWT token (if authenticated)
  const emailFromBody = req.body.email;
  const emailFromToken = req.user?.email;
  const email = emailFromBody || emailFromToken;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    // Check if user already exists and is verified
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.verified) {
      return res.status(400).json({
        success: false,
        message: "User already registered with this email",
      });
    }

    // Generate OTP (6 digits)
    const otp = OTPGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    // OTP expiry time (10 minutes)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update or create user with OTP
    if (existingUser) {
      existingUser.otp = otp;
      existingUser.otpExpire = otpExpiry;
      await existingUser.save();
    } else {
      const newUser = new User({
        email,
        otp,
        otpExpire: otpExpiry,
        verified: false,
      });
      await newUser.save();
    }

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
      data: {
        email,
        otpExpiresIn: "10 minutes",
      },
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

/**
 * Verify OTP and complete registration
 * @route POST /api/auth/verify-otp
 */
export const verifyOTP = async (req, res) => {
  const { email, otp, name, phone, password } = req.body;

  if (!email || !otp) {
    console.log('Missing required fields: email or otp');
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required",
    });
  }

  // For registration verification, require additional fields
  const isRegistration = name && phone && password;
  if (isRegistration && (!name || !phone || !password)) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields for registration",
    });
  }

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No account found for ${email}. Please register first.`,
      });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpire) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one",
      });
    }

    // Verify OTP
    if (user.otp !== otp && user.otp !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please check the code and try again",
      });
    }

    // Handle registration completion if additional data is provided
    if (isRegistration) {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user with registration details
      user.name = name;
      user.phone = phone;
      user.password = hashedPassword;
      user.verified = true;
      user.otp = undefined; // Clear OTP
      user.otpExpire = undefined; // Clear OTP expiry

      await user.save();

      res.status(200).json({
        success: true,
        message: "Email verified successfully. Registration complete",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            verified: user.verified,
          },
        },
      });
    } else {
      // Just verify email without completing registration
      user.verified = true;
      user.otp = undefined; // Clear OTP
      user.otpExpire = undefined; // Clear OTP expiry

      await user.save();

      res.status(200).json({
        success: true,
        message: "Email verified successfully",
        data: {
          user: {
            id: user._id,
            email: user.email,
            verified: user.verified,
          },
        },
      });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};

// ==================== LOGIN ====================
/**
 * Login user
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is verified
    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate access token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.REFRESH_JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          verified: user.verified,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

// ==================== FORGOT PASSWORD ====================
/**
 * Send password reset email with token
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please provide an email address",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link",
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Store token hash in database (for validation)
    const hashedToken = await bcrypt.hash(resetToken, 10);
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(email, resetUrl);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
      data: {
        email,
        expiresIn: "1 hour",
      },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send password reset email",
      error: error.message,
    });
  }
};

/**
 * Reset password with token
 * @route POST /api/auth/reset-password
 */
export const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide token and new password",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if reset token is still valid
    if (!user.resetPasswordToken || !user.resetPasswordExpire) {
      return res.status(400).json({
        success: false,
        message: "Reset token is invalid or expired",
      });
    }

    if (new Date() > user.resetPasswordExpire) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Reset token has expired",
      });
    }

    // Check if new password matches the token
    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isTokenValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. Please login with your new password",
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Reset token has expired",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

// ==================== REFRESH TOKEN ====================
/**
 * Refresh access token
 * @route POST /api/auth/refresh-token
 */


export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No refresh token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_JWT_SECRET);
    const user = await User.findById(decoded.userId);

    // Check if user still exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is verified
    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message: "User email not verified",
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          verified: user.verified,
        },
      },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token has expired",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refresh token",
      error: error.message,
    });
  }
};

// ==================== LOGOUT ====================
/**
 * Logout user by clearing refresh token
 * @route POST /api/auth/logout
 */
export const logout = (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to logout",
      error: error.message,
    });
  }
};