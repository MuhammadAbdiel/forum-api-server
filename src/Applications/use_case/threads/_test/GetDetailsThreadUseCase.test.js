const CommentLikeRepository = require("../../../../Domains/comment_likes/CommentLikeRepository");
const CommentReplyRepository = require("../../../../Domains/comment_replies/CommentReplyRepository");
const CommentReplyDetails = require("../../../../Domains/comment_replies/entities/CommentReplyDetails");
const CommentRepository = require("../../../../Domains/comments/CommentRepository");
const CommentDetails = require("../../../../Domains/comments/entities/CommentDetails");
const ThreadDetails = require("../../../../Domains/threads/entities/ThreadDetails");
const ThreadRepository = require("../../../../Domains/threads/ThreadRepository");
const UserRepository = require("../../../../Domains/users/UserRepository");

const GetDetailsThreadUseCase = require("../GetDetailsThreadUseCase");

describe("GetDetailsThreadUseCase", () => {
  it("should orchestrate get the details thread", async () => {
    // Arrange
    const userArnold = {
      id: "user-111",
      username: "Arnold Szechuan",
    };

    const userDhh = {
      id: "user-222",
      username: "DHH",
    };

    const mockThreadData = {
      id: "thread-123",
      title: "this is title thread",
      body: "this is body",
      created_at: "2023-07-18 20:38:31.448",
      user_id: "user-111",
    };

    const commentData = [
      {
        id: "comment-123",
        content: "**komentar telah dihapus**",
        created_at: "2023-08-17 20:38:31.448",
        user_id: "user-111",
        thread_id: "thread-123",
        is_delete: true,
      },
      {
        id: "comment-222",
        content: "this is second without reply",
        created_at: "2023-08-17 20:38:31.448",
        user_id: "user-111",
        thread_id: "thread-123",
        is_delete: false,
      },
      {
        id: "comment-333",
        content: "this is third without reply",
        created_at: "2023-08-17 20:38:31.448",
        user_id: "user-111",
        thread_id: "thread-123",
        is_delete: false,
      },
    ];

    const replyData = [
      {
        id: "reply-123",
        content: "**balasan telah dihapus**",
        created_at: "2023-08-18 20:38:31.448",
        user_id: "user-222",
        comment_id: "comment-123",
        is_delete: true,
      },
      {
        id: "reply-124",
        content: "this is second reply",
        created_at: "2023-08-18 20:38:31.448",
        user_id: "user-111",
        comment_id: "comment-123",
        is_delete: false,
      },
      {
        id: "reply-125",
        content: "this is third reply",
        created_at: "2023-08-18 20:38:31.448",
        user_id: "user-111",
        comment_id: "comment-123",
        is_delete: false,
      },
      {
        id: "reply-126",
        content: "this is fourth reply",
        created_at: "2023-08-18 20:38:31.448",
        user_id: "user-111",
        comment_id: "comment-123",
        is_delete: false,
      },
    ];

    const likeCountsArray = [
      { comment_id: "comment-123", count: 1 },
      { comment_id: "comment-222", count: 1 },
      { comment_id: "comment-333", count: 1 },
    ];

    /** creating dependency of use case */
    const mockCommentLikeRepository = new CommentLikeRepository();
    const mockCommentReplyRepository = new CommentReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThreadData));
    mockUserRepository.getUserById = jest.fn().mockImplementation((userId) => {
      if (userId === "user-111") {
        return Promise.resolve(userArnold);
      }
      if (userId === "user-222") {
        return Promise.resolve(userDhh);
      }
    });
    mockCommentRepository.getCommentByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(commentData));
    mockCommentLikeRepository.getCommentLikeCount = jest
      .fn()
      .mockImplementation((threadId) => {
        if (threadId === "thread-123") {
          return Promise.resolve(likeCountsArray);
        }
        return Promise.resolve([]);
      });
    mockCommentReplyRepository.getCommentReplyByCommentId = jest
      .fn()
      .mockImplementation((commentId) => {
        if (commentId === "comment-123") {
          return Promise.resolve(replyData);
        }
        return Promise.resolve([]);
      });

    /** create use case instance */
    const getDetailsThreadUseCase = new GetDetailsThreadUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentReplyRepository: mockCommentReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const threadDetails = await getDetailsThreadUseCase.execute("thread-123");

    // Assert
    expect(threadDetails.comments).toHaveLength(3);
    expect(threadDetails).toStrictEqual(
      new ThreadDetails({
        id: mockThreadData.id,
        title: mockThreadData.title,
        body: mockThreadData.body,
        date: mockThreadData.created_at,
        username: userArnold.username,
        comments: [
          new CommentDetails({
            id: commentData[0].id,
            content: commentData[0].content,
            date: commentData[0].created_at,
            username: userArnold.username,
            likeCount: 1,
            replies: [
              new CommentReplyDetails({
                id: replyData[0].id,
                content: replyData[0].content,
                date: replyData[0].created_at,
                username: userDhh.username,
              }),
              new CommentReplyDetails({
                id: replyData[1].id,
                content: replyData[1].content,
                date: replyData[1].created_at,
                username: userArnold.username,
              }),
              new CommentReplyDetails({
                id: replyData[2].id,
                content: replyData[2].content,
                date: replyData[2].created_at,
                username: userArnold.username,
              }),
              new CommentReplyDetails({
                id: replyData[3].id,
                content: replyData[3].content,
                date: replyData[3].created_at,
                username: userArnold.username,
              }),
            ],
          }),
          new CommentDetails({
            id: commentData[1].id,
            content: commentData[1].content,
            date: commentData[1].created_at,
            username: userArnold.username,
            likeCount: 1,
            replies: [],
          }),
          new CommentDetails({
            id: commentData[2].id,
            content: commentData[2].content,
            date: commentData[2].created_at,
            username: userArnold.username,
            likeCount: 1,
            replies: [],
          }),
        ],
      })
    );
    expect(threadDetails.comments[0].replies).toHaveLength(4);
    expect(threadDetails.comments[0].replies[0].username).toBe(
      userDhh.username
    );
    expect(threadDetails.comments[0].replies[1].username).toBe(
      userArnold.username
    );
    expect(threadDetails.comments[0].likeCount).toBe(1);
  });

  it("should orchestrate get the details thread if there are no comments", async () => {
    // Arrange
    const userArnold = {
      id: "user-111",
      username: "Arnold Szechuan",
    };

    const userDhh = {
      id: "user-222",
      username: "DHH",
    };

    const mockThreadData = {
      id: "thread-123",
      title: "this is title thread",
      body: "this is body",
      created_at: "2023-07-18 20:38:31.448",
      user_id: "user-111",
    };

    const commentData = [];

    /** creating dependency of use case */
    const mockCommentLikeRepository = new CommentLikeRepository();
    const mockCommentReplyRepository = new CommentReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThreadData));
    mockUserRepository.getUserById = jest.fn().mockImplementation((userId) => {
      if (userId === "user-111") {
        return Promise.resolve(userArnold);
      }
      if (userId === "user-222") {
        return Promise.resolve(userDhh);
      }
    });
    mockCommentRepository.getCommentByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(commentData));

    /** create use case instance */
    const getDetailsThreadUseCase = new GetDetailsThreadUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentReplyRepository: mockCommentReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const threadDetails = await getDetailsThreadUseCase.execute("thread-123");

    // Assert
    expect(threadDetails.comments).toHaveLength(0);
    expect(threadDetails).toStrictEqual(
      new ThreadDetails({
        id: mockThreadData.id,
        title: mockThreadData.title,
        body: mockThreadData.body,
        date: mockThreadData.created_at,
        username: userArnold.username,
        comments: [],
      })
    );
  });
});
