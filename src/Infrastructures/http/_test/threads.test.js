const {
  injection,
  addUserOption,
  addThreadOption,
  addAuthOption,
  addCommentOption,
  addCommentReplyOption,
} = require("../../../../tests/ServerInjectionFunctionHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const pool = require("../../database/postgres/pool");
const container = require("../../container");
const createServer = require("../createServer");

describe("/threads endpoint", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe("when POST /threads", () => {
    it("should response 201 and return correct added thread", async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: "First Thread",
        body: "This is first thread",
      };

      // Add account
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      const login = {
        username: "dicoding",
        password: "secret",
      };
      // login
      const auth = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: login,
      });

      const {
        data: { accessToken },
      } = JSON.parse(auth.payload);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      //Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toStrictEqual(201);
      expect(responseJson.status).toStrictEqual("success");
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it("should response 401 if no authorization", async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: "First Thread",
        body: "This is first thread",
      };
      const accessToken = "wrongtoken";

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toStrictEqual(401);
      expect(responseJson.error).toStrictEqual("Unauthorized");
    });

    it("should response 400 if bad payload", async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: "First Thread",
      };
      // Add account
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });

      const login = {
        username: "dicoding",
        password: "secret",
      };
      // login
      const auth = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: login,
      });

      const {
        data: { accessToken },
      } = JSON.parse(auth.payload);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toStrictEqual(400);
      expect(responseJson.status).toStrictEqual("fail");
      expect(responseJson.message).toStrictEqual(
        "cannot make a new thread, payload not correct"
      );
    });
  });

  describe("when GET /threads", () => {
    it("should display all threads", async () => {
      // Arrange
      const threadPayload = {
        title: "First Thread",
        body: "This is first thread",
      };

      const userPayload = {
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };

      const loginPayload = {
        username: "dicoding",
        password: "secret",
      };

      const server = await createServer(container);

      // Add account
      await injection(server, addUserOption(userPayload));
      // login
      const auth = await injection(server, addAuthOption(loginPayload));
      const authToken = JSON.parse(auth.payload)?.data?.accessToken;

      // add thread
      await injection(server, addThreadOption(threadPayload, authToken));

      // Action
      const response = await server.inject({
        method: "GET",
        url: "/threads",
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toStrictEqual(200);
      expect(responseJson.status).toStrictEqual("success");
      expect(responseJson.data.threads).toBeDefined();
      expect(Array.isArray(responseJson.data.threads)).toBe(true);
    });
  });

  describe("when GET /threads/{threadsId}", () => {
    it("it should display the right thread details", async () => {
      // Arrange

      const commentPayload = {
        content: "This is comment",
      };

      const threadPayload = {
        title: "First Thread",
        body: "This is first thread",
      };

      const userPayload = {
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };

      const loginPayload = {
        username: "dicoding",
        password: "secret",
      };

      const requestPayload = {
        content: "This is reply",
      };

      const mockThreadDetails = {};

      const server = await createServer(container);

      // Add account
      await injection(server, addUserOption(userPayload));
      // login
      const auth = await injection(server, addAuthOption(loginPayload));
      const authToken = JSON.parse(auth.payload)?.data?.accessToken;

      // add thread
      const thread = await injection(
        server,
        addThreadOption(threadPayload, authToken)
      );
      const threadId = JSON.parse(thread.payload)?.data?.addedThread.id;

      // add comment
      const comment = await injection(
        server,
        addCommentOption(commentPayload, authToken, threadId)
      );
      const commentId = JSON.parse(comment.payload)?.data?.addedComment.id;

      // add comment replies
      await injection(
        server,
        addCommentReplyOption(requestPayload, authToken, threadId, commentId)
      );

      // Action
      const response = await server.inject({
        method: "GET",
        url: `/threads/${threadId}`,
      });

      //Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toStrictEqual(200);
      expect(responseJson.status).toStrictEqual("success");
      expect(responseJson.data.thread).toBeDefined();
    });
  });
});
