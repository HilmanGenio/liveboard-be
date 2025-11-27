import { Response } from 'express';
import { PostService } from '../services/postService';
import { AuthRequest } from '../middleware/auth';
import { getIO } from '../socket';
import Joi from 'joi';

const createPostSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required()
});

export class PostController {
  static async getAllPosts(req: AuthRequest, res: Response) {
    try {
      const posts = await PostService.getAllPosts();
      
      res.json({
        success: true,
        data: posts
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async createPost(req: AuthRequest, res: Response) {
    try {
      const { error, value } = createPostSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { content } = value;
      const userId = req.userId!;

      const post = await PostService.createPost(content, userId);

      // Broadcast to all connected clients
      const io = getIO();
      io.emit('new_post', post);

      res.status(201).json({
        success: true,
        data: post
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async toggleLike(req: AuthRequest, res: Response) {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.userId!;

      if (isNaN(postId)) {
        return res.status(400).json({ error: 'Invalid post ID' });
      }

      const result = await PostService.toggleLike(postId, userId);

      // Broadcast like update to all connected clients with user info
      const io = getIO();
      io.emit('like_update', {
        ...result,
        userId: userId // Add userId to help frontend determine who liked
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
