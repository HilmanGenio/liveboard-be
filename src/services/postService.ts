import { prisma } from '../utils/db';

export class PostService {
  static async getAllPosts() {
    return await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async createPost(content: string, authorId: number) {
    const post = await prisma.post.create({
      data: {
        content,
        authorId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true
          }
        }
      }
    });

    return post;
  }

  static async toggleLike(postId: number, userId: number) {
    // Check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId,
          postId
        }
      });
    }

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { postId }
    });

    return {
      postId,
      likeCount,
      isLiked: !existingLike
    };
  }
}
