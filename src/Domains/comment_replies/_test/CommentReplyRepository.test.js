const CommentReplyRepository = require("../CommentReplyRepository");

describe("CommentReplyRepository interface", () => {
  it("should throw error when invoke abstract behaviot", async () => {
    // Arrange
    const commentReplyRepository = new CommentReplyRepository();
    // Action and Assert

    await expect(
      commentReplyRepository.addCommentReply("", "", "", "")
    ).rejects.toThrow("COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    await expect(
      commentReplyRepository.getCommentReplyById("")
    ).rejects.toThrow("COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    await expect(
      commentReplyRepository.verifyCommentReplyAvailability("")
    ).rejects.toThrow("COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    await expect(
      commentReplyRepository.verifyCommentReplyOwner("", "")
    ).rejects.toThrow("COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    await expect(
      commentReplyRepository.getCommentReplyByCommentId("")
    ).rejects.toThrow("COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    await expect(
      commentReplyRepository.deleteCommentReply("", "", "", "")
    ).rejects.toThrow("COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  });
});
