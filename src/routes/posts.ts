import { Router } from 'express';
import { PostController } from '../controllers/postController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', PostController.getAllPosts);
router.post('/', authMiddleware, PostController.createPost);
router.post('/:id/like', authMiddleware, PostController.toggleLike);

export default router;
