import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PostService } from './post.service';
import { CreatePostInput } from './dto/createPost.input';
import { CreatePostResponse } from './dto/createPost.response';
import { PostEntity } from './post.entity';
import { GetUserPostsInput } from './dto/getUserPosts.input';
import { GetAllPostsInput } from './dto/getAllPosts.input';
import { ViewPostInput } from './dto/viewPost.input';

@Resolver()
export class PostResolver {
  constructor(private postService: PostService) {}

  @Mutation(() => CreatePostResponse)
  public createPost(@Args('createPostInput') createPostInput: CreatePostInput) {
    return this.postService.createPost(createPostInput);
  }

  @Mutation(() => PostEntity)
  public viewPost(@Args('viewPostInput') viewPostInput: ViewPostInput) {
    return this.postService.viewPost(viewPostInput);
  }

  @Query(() => [PostEntity])
  public getUserPosts(
    @Args('getUserPostsInput') getUserPostsInput: GetUserPostsInput,
  ) {
    return this.postService.getUserPosts(getUserPostsInput);
  }

  @Query(() => [PostEntity])
  public getAllPosts(
    @Args('getAllPostsInput') getAllPostsInput: GetAllPostsInput,
  ) {
    return this.postService.getAllPosts(getAllPostsInput);
  }
}
