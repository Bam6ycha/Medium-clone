import { Test, TestingModule } from '@nestjs/testing';
import { PostResolver } from './post.resolver';
import { PostService } from './post.service';
import { CreatePostInput } from './dto/createPost.input';
import { ViewPostInput } from './dto/viewPost.input';
import { PostEntity } from './post.entity';
import { PrismaService } from '../prisma/prisma.service';

describe('PostResolver', () => {
  let postResolver: PostResolver;
  let postService: PostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostResolver, PostService, PrismaService],
    }).compile();

    postResolver = module.get<PostResolver>(PostResolver);
    postService = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(postResolver).toBeDefined();
  });

  describe('createPost', () => {
    it('should create a post', async () => {
      const createPostInput: CreatePostInput = {
        title: 'title',
        content: 'content',
        userId: 1,
      };

      const createdPost: PostEntity = {
        id: 1,
        title: 'title',
        content: 'content',
        viewers: [],
      };

      postService.createPost = jest.fn().mockResolvedValueOnce(createdPost);

      const result = await postResolver.createPost(createPostInput);

      expect(postService.createPost).toHaveBeenCalledTimes(1);
      expect(result).toEqual(createdPost);
    });
  });

  describe('viewPost', () => {
    it('should view a post', async () => {
      const viewPostInput: ViewPostInput = { id: 2, userId: 1 };

      const viewedPost: PostEntity = {
        id: viewPostInput.id,
        content: 'content',
        title: 'title',
        viewers: [
          {
            id: viewPostInput.userId,
            role: 'user',
            email: 'email@mail.ru',
            name: 'name',
          },
        ],
      };

      postService.viewPost = jest.fn().mockResolvedValueOnce(viewedPost);

      const result = await postResolver.viewPost(viewPostInput);

      expect(postService.viewPost).toHaveBeenCalledTimes(1);
      expect(result).toEqual(viewedPost);
    });
  });

  // The same logic for the remaining methods
});
