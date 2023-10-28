import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostInput } from './dto/createPost.input';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { GetUserPostsInput } from './dto/getUserPosts.input';
import { GetAllPostsInput } from './dto/getAllPosts.input';
import { ViewPostInput } from './dto/viewPost.input';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(private prisma: PrismaService) {}

  public async createPost({
    content,
    userId: authorId,
    title,
  }: CreatePostInput) {
    try {
      return await this.prisma.post.create({
        select: { content: true, title: true, id: true },
        data: { content, title, author: { connect: { id: authorId } } },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException(
            `Operation failed because it depends on one or more records that were required but not found. No 'User' record(s) was found for a nested connect on one-to-many relation`,
          );
        }
      }

      this.logger.error((error as Error).message);

      throw new BadRequestException((error as Error).message);
    }
  }

  public async getUserPosts({
    cursor: postId,
    limit,
    userId,
  }: GetUserPostsInput) {
    try {
      return await this.prisma.post.findMany(
        this.getCursorPaginationParams(postId, limit, userId),
      );
    } catch (error) {
      this.logger.error((error as Error).message);

      throw new BadRequestException('Bad request');
    }
  }

  public async getAllPosts({ cursor: postId, limit }: GetAllPostsInput) {
    try {
      return await this.prisma.post.findMany(
        this.getCursorPaginationParams(postId, limit),
      );
    } catch (error) {
      this.logger.error((error as Error).message);

      throw new BadRequestException('Bad request');
    }
  }

  public async viewPost({ id: postId, userId }: ViewPostInput) {
    try {
      return await this.prisma.post.update({
        select: {
          id: true,
          content: true,
          title: true,
          viewers: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        where: { id: postId },
        data: { viewers: { connect: { id: userId } } },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException(
            `Operation failed because it depends on one or more records that were required but not found. No 'User' record(s) was found for a nested connect on one-to-many relation`,
          );
        }
      }

      this.logger.error((error as Error).message);

      throw new BadRequestException((error as Error).message);
    }
  }

  private getCursorPaginationParams(
    postId: number,
    limit: number,
    userId?: number,
  ) {
    return {
      ...(userId && { where: { userId } }),
      take: limit,
      cursor: { id: postId },
    };
  }
}
