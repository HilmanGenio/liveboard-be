import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import Joi from 'joi';

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { error, value } = registerSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { email, password, name } = value;
      const user = await AuthService.register(email, password, name);

      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { email, password } = value;
      const result = await AuthService.login(email, password);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }
}
