import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/db';
import { config } from '../utils/config';

export class AuthService {
  static async register(email: string, password: string, name: string) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password with salt rounds
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim()
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    return user;
  }

  static async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      },
      config.JWT_SECRET,
      { 
        expiresIn: config.JWT_EXPIRES_IN,
        issuer: 'liveboard-api',
        audience: 'liveboard-client'
      }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }

  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
