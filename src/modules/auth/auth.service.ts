import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/databese';
import { AppError } from '../../utils/apperror';

export const registerUser = async (body: any) => {
  const { name, email, password, role = 'contributor' } = body;

  const checkUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
 if ((checkUser.rowCount ?? 0) > 0) {
  throw new AppError(400, 'Conflict: Email already exists');
}

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at, updated_at',
    [name, email, hashedPassword, role]
  );

  return result.rows[0];
};

export const loginUser = async (body: any) => {
  const { email, password } = body;
  if (!email || !password) {
    throw new AppError(400, 'Bad Request: email and password are required');
  }

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rowCount === 0) {
    throw new AppError(401, 'Unauthorized: Invalid email or password');
  }

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(401, 'Unauthorized: Invalid email or password');
  }

  const payload = { id: user.id, name: user.name, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
};