// import type {
//   Request,
//   Response,
//   NextFunction,
// } from "express";
// import * as authService from './auth.service';
// import { sendSuccess } from '../../utils/response';

// export const signup = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const data = await authService.registerUser(req.body);
//     return sendSuccess(res, 201, 'User registered successfully', data);
//   } catch (error) {
//     next(error);
//   }
// };

// export const login = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const data = await authService.loginUser(req.body);
//     return sendSuccess(res, 200, 'Login successful', data);
//   } catch (error) {
//     next(error);
//   }
// };






















// import type {
//   Request,
//   Response,
//   NextFunction,
// } from "express";
// import bcrypt from 'bcrypt';
// import { pool } from '../../config/databese'; 
// import { AppError } from '../../utils/apperror';

// export const signup = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // ১. রিকোয়েস্ট বডি থেকে ডেটা নেওয়া
//     const { name, email, password, role } = req.body;

//     // ২. পাসওয়ার্ড হ্যাশ করা (সিকিউরিটির জন্য)
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ৩. ডাটাবেজে ইনসার্ট করা (Raw SQL)
//     const result = await pool.query(
//       'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
//       [name, email, hashedPassword, role || 'contributor']
//     );

//     // ৪. সফল রেসপন্স পাঠানো
//     res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       data: result.rows[0]
//     });

//   } catch (error: any) {
   

//     if (error.code === '23505') {
//       return next(new AppError(400, "Email already exists"));
//     }

//     next(error);
//   }
// };










import type { Request, Response, NextFunction } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // এটি ইমপোর্ট করতে ভুলবেন না
import { pool } from '../../config/databese'; 
import { AppError } from '../../utils/apperror';

// --- Signup Controller ---
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at, updated_at',
      [name, email, hashedPassword, role || 'contributor']
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return next(new AppError(400, "Email already exists"));
    }
    next(error);
  }
};

// --- Login Controller (এটি যোগ করুন) ---
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // ১. ইউজারকে ইমেইল দিয়ে ডাটাবেজে খোঁজা
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rowCount === 0) {
      throw new AppError(401, "Unauthorized: Invalid email or password");
    }

    const user = userResult.rows[0];

    // ২. পাসওয়ার্ড চেক করা
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, "Unauthorized: Invalid email or password");
    }

    // ৩. JWT টোকেন তৈরি করা (Payload-এ id, name, role রাখা হয়েছে)
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET || 'secret', // .env থেকে সিক্রেট কি
      { expiresIn: '24h' }
    );

    // ৪. সফল রেসপন্স
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }
    });

  } catch (error) {
    next(error);
  }
};