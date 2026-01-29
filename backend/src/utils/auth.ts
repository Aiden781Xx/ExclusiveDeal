import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

const JWT_SECRET = (process.env.JWT_SECRET || 'secret').trim();

export const generateToken = (userId: string, email: string, isVerified: boolean): string => {
  return jwt.sign({ id: userId, email, isVerified }, JWT_SECRET, { expiresIn: '7d' });
};

export const generateClaimCode = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
