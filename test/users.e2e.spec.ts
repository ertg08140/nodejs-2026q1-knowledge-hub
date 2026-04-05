import { validate } from 'uuid';
import { StatusCodes } from 'http-status-codes';
import { request } from './lib';
import {
  getTokenAndUserId,
  shouldAuthorizationBeTested,
  removeTokenUser,
} from './utils';
import { usersRoutes, articlesRoutes, commentsRoutes } from './endpoints';

const createUserDto = {
  login: 'TEST_LOGIN',
  password: 'TEST_PASSWORD',
};

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('Users (e2e)', () => {
  const unauthorizedRequest = request;
  const commonHeaders = { Accept: 'application/json' };
  let mockUserId: string | undefined;

  beforeAll(async () => {
    if (shouldAuthorizationBeTested) {
      const result = await getTokenAndUserId(unauthorizedRequest);
      commonHeaders['Authorization'] = result.token;
      mockUserId = result.mockUserId;
    }
  });

  afterAll(async () => {
    // delete mock user
    if (mockUserId) {
      await removeTokenUser(unauthorizedRequest, mockUserId, commonHeaders);
    }

    if (commonHeaders['Authorization']) {
      delete commonHeaders['Authorization'];
    }
  });

  describe('CUSTOM TESTS - GET (pagination and sorting)', () => {
    it('should correctly paginate users with page and limit', async () => {
      // Create multiple users
      const userIds: string[] = [];

      for (let i = 0; i < 5; i++) {
        const creationResponse = await unauthorizedRequest
          .post(usersRoutes.create)
          .set(commonHeaders)
          .send({ ...createUserDto, login: `TEST_LOGIN_${i}` });
        console.log('creationResponse', creationResponse.statusCode, i);
        expect(creationResponse.statusCode).toBe(StatusCodes.CREATED);
        userIds.push(creationResponse.body.id);
      }

      // Test pagination: page 1 with limit 2
      const response1 = await unauthorizedRequest
        .get(`${usersRoutes.getAll}?page=1&limit=2`)
        .set(commonHeaders);

      expect(response1.status).toBe(StatusCodes.OK);
      expect(response1.body.data).toBeInstanceOf(Array);
      expect(response1.body.data.length).toBeLessThanOrEqual(2);

      // Test pagination: page 2 with limit 2
      const response2 = await unauthorizedRequest
        .get(`${usersRoutes.getAll}?page=2&limit=2`)
        .set(commonHeaders);

      expect(response2.status).toBe(StatusCodes.OK);
      expect(response2.body.data).toBeInstanceOf(Array);

      // Cleanup
      for (const id of userIds) {
        await unauthorizedRequest
          .delete(usersRoutes.delete(id))
          .set(commonHeaders);
      }
    });

    it('should correctly sort users by login in ascending and descending order', async () => {
      // Create multiple users
      const userIds: string[] = [];

      for (let i = 0; i < 3; i++) {
        const creationResponse = await unauthorizedRequest
          .post(usersRoutes.create)
          .set(commonHeaders)
          .send({ ...createUserDto, login: `SORT_LOGIN_${i}` });

        expect(creationResponse.statusCode).toBe(StatusCodes.CREATED);
        userIds.push(creationResponse.body.id);
      }

      // Test sorting in ascending order
      const responseAsc = await unauthorizedRequest
        .get(`${usersRoutes.getAll}?sortBy=login&order=asc`)
        .set(commonHeaders);

      expect(responseAsc.status).toBe(StatusCodes.OK);
      expect(responseAsc.body).toBeInstanceOf(Array);
      expect(responseAsc.body[0].login).toEqual('SORT_LOGIN_0');

      // Test sorting in descending order
      const responseDesc = await unauthorizedRequest
        .get(`${usersRoutes.getAll}?sortBy=login&order=desc`)
        .set(commonHeaders);

      expect(responseDesc.status).toBe(StatusCodes.OK);
      expect(responseDesc.body).toBeInstanceOf(Array);
      expect(responseDesc.body[0].login).toEqual('SORT_LOGIN_2');

      // Cleanup
      for (const id of userIds) {
        await unauthorizedRequest
          .delete(usersRoutes.delete(id))
          .set(commonHeaders);
      }
    });
  });

  describe('GET', () => {
    it('should correctly get all users', async () => {
      const response = await unauthorizedRequest
        .get(usersRoutes.getAll)
        .set(commonHeaders);
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Array);
    });

    it('should correctly get user by id', async () => {
      const creationResponse = await unauthorizedRequest
        .post(usersRoutes.create)
        .set(commonHeaders)
        .send(createUserDto);

      const { id } = creationResponse.body;

      expect(creationResponse.statusCode).toBe(StatusCodes.CREATED);

      const searchResponse = await unauthorizedRequest
        .get(usersRoutes.getById(id))
        .set(commonHeaders);

      expect(searchResponse.statusCode).toBe(StatusCodes.OK);
      expect(searchResponse.body).toBeInstanceOf(Object);

      const cleanupResponse = await unauthorizedRequest
        .delete(usersRoutes.delete(id))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    it('should respond with BAD_REQUEST status code in case of invalid id', async () => {
      const response = await unauthorizedRequest
        .get(usersRoutes.getById('some-invalid-id'))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should respond with NOT_FOUND status code in case if user doesn't exist", async () => {
      const response = await unauthorizedRequest
        .get(usersRoutes.getById(randomUUID))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('POST', () => {
    it('should correctly create user', async () => {
      const response = await unauthorizedRequest
        .post(usersRoutes.create)
        .set(commonHeaders)
        .send(createUserDto);

      const { id, role, login, createdAt, updatedAt } = response.body;

      expect(response.status).toBe(StatusCodes.CREATED);

      expect(login).toBe(createUserDto.login);
      expect(response.body).not.toHaveProperty('password');
      expect(validate(id)).toBe(true);
      expect(role).toBe('viewer');
      expect(typeof createdAt).toBe('number');
      expect(typeof updatedAt).toBe('number');
      expect(createdAt === updatedAt).toBe(true);

      const cleanupResponse = await unauthorizedRequest
        .delete(usersRoutes.delete(id))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    it('should respond with BAD_REQUEST in case of invalid required data', async () => {
      const responses = await Promise.all([
        unauthorizedRequest
          .post(usersRoutes.create)
          .set(commonHeaders)
          .send({}),
        unauthorizedRequest
          .post(usersRoutes.create)
          .set(commonHeaders)
          .send({ login: 'TEST_LOGIN' }),
        unauthorizedRequest
          .post(usersRoutes.create)
          .set(commonHeaders)
          .send({ password: 'TEST_PASSWORD' }),
        unauthorizedRequest
          .post(usersRoutes.create)
          .set(commonHeaders)
          .send({ login: null, password: 12345 }),
      ]);

      expect(
        responses.every(
          ({ statusCode }) => statusCode === StatusCodes.BAD_REQUEST,
        ),
      ).toBe(true);
    });
  });

  describe('PUT', () => {
    it('should correctly update user password match', async () => {
      const creationResponse = await unauthorizedRequest
        .post(usersRoutes.create)
        .set(commonHeaders)
        .send(createUserDto);

      const { id: createdId, createdAt: initialCreatedAt } =
        creationResponse.body;

      expect(creationResponse.status).toBe(StatusCodes.CREATED);

      const updateResponse = await unauthorizedRequest
        .put(usersRoutes.update(createdId))
        .set(commonHeaders)
        .send({
          oldPassword: createUserDto.password,
          newPassword: 'NEW_PASSWORD',
        });

      expect(updateResponse.statusCode).toBe(StatusCodes.OK);

      const updatedUserResponse = await unauthorizedRequest
        .get(usersRoutes.getById(createdId))
        .set(commonHeaders);

      const {
        id: updatedId,
        login,
        createdAt,
        updatedAt,
      } = updatedUserResponse.body;

      expect(login).toBe(createUserDto.login);
      expect(updateResponse.body).not.toHaveProperty('password');
      expect(validate(updatedId)).toBe(true);
      expect(createdId).toBe(updatedId);
      expect(typeof createdAt).toBe('number');
      expect(typeof updatedAt).toBe('number');
      expect(createdAt).toBe(initialCreatedAt);
      expect(updatedAt).toBeGreaterThan(createdAt);

      const updateResponse2 = await unauthorizedRequest
        .put(usersRoutes.update(createdId))
        .set(commonHeaders)
        .send({
          oldPassword: createUserDto.password,
          newPassword: 'NEW_PASSWORD',
        });

      expect(updateResponse2.statusCode).toBe(StatusCodes.FORBIDDEN);

      const cleanupResponse = await unauthorizedRequest
        .delete(usersRoutes.delete(createdId))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    it('should respond with BAD_REQUEST status code in case of invalid id', async () => {
      const response = await unauthorizedRequest
        .put(usersRoutes.update('some-invalid-id'))
        .set(commonHeaders)
        .send({
          oldPassword: 'test',
          newPassword: 'fake',
        });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should respond with BAD_REQUEST status code in case of invalid dto', async () => {
      const response = await unauthorizedRequest
        .put(usersRoutes.update(randomUUID))
        .set(commonHeaders)
        .send({});

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should respond with NOT_FOUND status code in case if user doesn't exist", async () => {
      const response = await unauthorizedRequest
        .put(usersRoutes.update(randomUUID))
        .set(commonHeaders)
        .send({
          oldPassword: 'test',
          newPassword: 'fake',
        });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('DELETE', () => {
    it('should correctly delete user', async () => {
      const response = await unauthorizedRequest
        .post(usersRoutes.create)
        .set(commonHeaders)
        .send(createUserDto);

      const { id } = response.body;

      expect(response.status).toBe(StatusCodes.CREATED);

      const cleanupResponse = await unauthorizedRequest
        .delete(usersRoutes.delete(id))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);

      const searchResponse = await unauthorizedRequest
        .get(usersRoutes.getById(id))
        .set(commonHeaders);

      expect(searchResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('should respond with BAD_REQUEST status code in case of invalid id', async () => {
      const response = await unauthorizedRequest
        .delete(usersRoutes.delete('some-invalid-id'))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should respond with NOT_FOUND status code in case if user doesn't exist", async () => {
      const response = await unauthorizedRequest
        .delete(usersRoutes.delete(randomUUID))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should set article.authorId to null and delete user comments after deletion', async () => {
      const createResponse = await unauthorizedRequest
        .post(usersRoutes.create)
        .set(commonHeaders)
        .send(createUserDto);

      const { id: userId } = createResponse.body;
      expect(createResponse.status).toBe(StatusCodes.CREATED);

      // Create article authored by this user
      const createArticleDto = {
        title: 'TEST_ARTICLE',
        content: 'Test content',
        status: 'draft',
        authorId: userId,
        categoryId: null,
        tags: [],
      };

      const createArticleResponse = await unauthorizedRequest
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send(createArticleDto);

      const { id: articleId } = createArticleResponse.body;
      expect(createArticleResponse.status).toBe(StatusCodes.CREATED);

      // Create comment by this user
      const createCommentDto = {
        content: 'Test comment',
        articleId,
        authorId: userId,
      };

      const createCommentResponse = await unauthorizedRequest
        .post(commentsRoutes.create)
        .set(commonHeaders)
        .send(createCommentDto);

      const { id: commentId } = createCommentResponse.body;
      expect(createCommentResponse.status).toBe(StatusCodes.CREATED);

      // Delete user
      const deleteResponse = await unauthorizedRequest
        .delete(usersRoutes.delete(userId))
        .set(commonHeaders);

      expect(deleteResponse.statusCode).toBe(StatusCodes.NO_CONTENT);

      // Verify article.authorId is null
      const searchArticleResponse = await unauthorizedRequest
        .get(articlesRoutes.getById(articleId))
        .set(commonHeaders);

      expect(searchArticleResponse.statusCode).toBe(StatusCodes.OK);
      expect(searchArticleResponse.body.authorId).toBeNull();

      // Verify comment is deleted
      const searchCommentResponse = await unauthorizedRequest
        .get(commentsRoutes.getById(commentId))
        .set(commonHeaders);

      expect(searchCommentResponse.statusCode).toBe(StatusCodes.NOT_FOUND);

      // Cleanup article
      const cleanupArticle = await unauthorizedRequest
        .delete(articlesRoutes.delete(articleId))
        .set(commonHeaders);

      expect(cleanupArticle.statusCode).toBe(StatusCodes.NO_CONTENT);
    });
  });
});
