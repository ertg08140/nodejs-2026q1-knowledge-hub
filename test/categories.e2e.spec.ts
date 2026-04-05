import { request } from './lib';
import { StatusCodes } from 'http-status-codes';
import { validate } from 'uuid';
import {
  getTokenAndUserId,
  shouldAuthorizationBeTested,
  removeTokenUser,
} from './utils';
import { categoriesRoutes, articlesRoutes } from './endpoints';

const createCategoryDto = {
  name: 'TEST_CATEGORY',
  description: 'Test category description',
};

// Probability of collisions for UUID is almost zero
const randomUUID = '0a35dd62-e09f-444b-a628-f4e7c6954f57';

describe('Category (e2e)', () => {
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
    beforeAll(async () => {
      // Clean up any existing test categories
      const allCategories = await unauthorizedRequest
        .get(categoriesRoutes.getAll)
        .set(commonHeaders);

      if (allCategories.body && Array.isArray(allCategories.body)) {
        for (const category of allCategories.body) {
          if (
            category.name.includes('TEST_CATEGORY') ||
            category.name.includes('SORT_CATEGORY')
          ) {
            await unauthorizedRequest
              .delete(categoriesRoutes.delete(category.id))
              .set(commonHeaders);
          }
        }
      }
    });

    it('should correctly paginate categories with page and limit', async () => {
      // Create multiple categories
      const categoryIds: string[] = [];

      for (let i = 0; i < 5; i++) {
        const creationResponse = await unauthorizedRequest
          .post(categoriesRoutes.create)
          .set(commonHeaders)
          .send({ ...createCategoryDto, name: `TEST_CATEGORY_${i}` });

        expect(creationResponse.statusCode).toBe(StatusCodes.CREATED);
        categoryIds.push(creationResponse.body.id);
      }

      // Test pagination: page 1 with limit 2
      const response1 = await unauthorizedRequest
        .get(`${categoriesRoutes.getAll}?page=1&limit=2`)
        .set(commonHeaders);

      expect(response1.status).toBe(StatusCodes.OK);
      expect(response1.body.data).toBeInstanceOf(Array);
      expect(response1.body.data.length).toBeLessThanOrEqual(2);

      // Test pagination: page 2 with limit 2
      const response2 = await unauthorizedRequest
        .get(`${categoriesRoutes.getAll}?page=2&limit=2`)
        .set(commonHeaders);

      expect(response2.status).toBe(StatusCodes.OK);
      expect(response2.body.data).toBeInstanceOf(Array);

      // Cleanup
      for (const id of categoryIds) {
        await unauthorizedRequest
          .delete(categoriesRoutes.delete(id))
          .set(commonHeaders);
      }
    });

    it('should correctly sort categories by name in ascending and descending order', async () => {
      // Create multiple categories
      const categoryIds: string[] = [];

      for (let i = 0; i < 3; i++) {
        const creationResponse = await unauthorizedRequest
          .post(categoriesRoutes.create)
          .set(commonHeaders)
          .send({ ...createCategoryDto, name: `SORT_CATEGORY_${i}` });

        expect(creationResponse.statusCode).toBe(StatusCodes.CREATED);
        categoryIds.push(creationResponse.body.id);
      }

      // Test sorting in ascending order
      const responseAsc = await unauthorizedRequest
        .get(`${categoriesRoutes.getAll}?sortBy=name&order=asc`)
        .set(commonHeaders);

      expect(responseAsc.status).toBe(StatusCodes.OK);
      expect(responseAsc.body).toBeInstanceOf(Array);
      expect(responseAsc.body[0].name).toEqual('SORT_CATEGORY_0');

      // Test sorting in descending order
      const responseDesc = await unauthorizedRequest
        .get(`${categoriesRoutes.getAll}?sortBy=name&order=desc`)
        .set(commonHeaders);

      expect(responseDesc.status).toBe(StatusCodes.OK);
      expect(responseDesc.body).toBeInstanceOf(Array);
      expect(responseDesc.body[0].name).toEqual('SORT_CATEGORY_2');

      // Cleanup
      for (const id of categoryIds) {
        await unauthorizedRequest
          .delete(categoriesRoutes.delete(id))
          .set(commonHeaders);
      }
    });
  });

  describe('GET', () => {
    it('should correctly get all categories', async () => {
      const response = await unauthorizedRequest
        .get(categoriesRoutes.getAll)
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Array);
    });

    it('should correctly get category by id', async () => {
      const creationResponse = await unauthorizedRequest
        .post(categoriesRoutes.create)
        .set(commonHeaders)
        .send(createCategoryDto);

      const { id } = creationResponse.body;

      expect(creationResponse.statusCode).toBe(StatusCodes.CREATED);

      const searchResponse = await unauthorizedRequest
        .get(categoriesRoutes.getById(id))
        .set(commonHeaders);

      expect(searchResponse.statusCode).toBe(StatusCodes.OK);
      expect(searchResponse.body).toBeInstanceOf(Object);

      const cleanupResponse = await unauthorizedRequest
        .delete(categoriesRoutes.delete(id))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    it('should respond with BAD_REQUEST status code in case of invalid id', async () => {
      const response = await unauthorizedRequest
        .get(categoriesRoutes.getById('some-invalid-id'))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should respond with NOT_FOUND status code in case if category doesn't exist", async () => {
      const response = await unauthorizedRequest
        .get(categoriesRoutes.getById(randomUUID))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('POST', () => {
    it('should correctly create category', async () => {
      const response = await unauthorizedRequest
        .post(categoriesRoutes.create)
        .set(commonHeaders)
        .send(createCategoryDto);

      const { id, name, description } = response.body;

      expect(response.status).toBe(StatusCodes.CREATED);

      expect(name).toBe(createCategoryDto.name);
      expect(description).toBe(createCategoryDto.description);
      expect(validate(id)).toBe(true);

      const cleanupResponse = await unauthorizedRequest
        .delete(categoriesRoutes.delete(id))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    it('should respond with BAD_REQUEST in case of invalid required data', async () => {
      const responses = await Promise.all([
        unauthorizedRequest
          .post(categoriesRoutes.create)
          .set(commonHeaders)
          .send({}),
        unauthorizedRequest
          .post(categoriesRoutes.create)
          .set(commonHeaders)
          .send({ name: 'TEST_CATEGORY' }),
        unauthorizedRequest
          .post(categoriesRoutes.create)
          .set(commonHeaders)
          .send({ description: 'Test description' }),
        unauthorizedRequest
          .post(categoriesRoutes.create)
          .set(commonHeaders)
          .send({ name: null, description: 12345 }),
      ]);

      expect(
        responses.every(
          ({ statusCode }) => statusCode === StatusCodes.BAD_REQUEST,
        ),
      ).toBe(true);
    });
  });

  describe('PUT', () => {
    it('should correctly update category', async () => {
      const creationResponse = await unauthorizedRequest
        .post(categoriesRoutes.create)
        .set(commonHeaders)
        .send(createCategoryDto);

      const { id: createdId } = creationResponse.body;

      expect(creationResponse.status).toBe(StatusCodes.CREATED);

      const updatedDescription = 'Updated description';

      const { statusCode } = await unauthorizedRequest
        .put(categoriesRoutes.update(createdId))
        .set(commonHeaders)
        .send({
          name: createCategoryDto.name,
          description: updatedDescription,
        });

      expect(statusCode).toBe(StatusCodes.OK);

      const updatedCategoryResponse = await unauthorizedRequest
        .get(categoriesRoutes.getById(createdId))
        .set(commonHeaders);

      const { id: updatedId, name, description } = updatedCategoryResponse.body;

      expect(name).toBe(createCategoryDto.name);
      expect(description).toBe(updatedDescription);
      expect(validate(updatedId)).toBe(true);
      expect(createdId).toBe(updatedId);

      const cleanupResponse = await unauthorizedRequest
        .delete(categoriesRoutes.delete(createdId))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    it('should respond with BAD_REQUEST status code in case of invalid id', async () => {
      const response = await unauthorizedRequest
        .put(categoriesRoutes.update('some-invalid-id'))
        .set(commonHeaders)
        .send({
          name: createCategoryDto.name,
          description: 'Updated',
        });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should respond with BAD_REQUEST status code in case of invalid dto', async () => {
      const creationResponse = await unauthorizedRequest
        .post(categoriesRoutes.create)
        .set(commonHeaders)
        .send(createCategoryDto);

      const { id: createdId } = creationResponse.body;
      expect(creationResponse.status).toBe(StatusCodes.CREATED);

      const response = await unauthorizedRequest
        .put(categoriesRoutes.update(createdId))
        .set(commonHeaders)
        .send({
          name: 12345,
          description: true,
        });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should respond with NOT_FOUND status code in case if category doesn't exist", async () => {
      const response = await unauthorizedRequest
        .put(categoriesRoutes.update(randomUUID))
        .set(commonHeaders)
        .send({
          name: createCategoryDto.name,
          description: 'Updated',
        });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('DELETE', () => {
    it('should correctly delete category', async () => {
      const response = await unauthorizedRequest
        .post(categoriesRoutes.create)
        .set(commonHeaders)
        .send(createCategoryDto);

      const { id } = response.body;

      expect(response.status).toBe(StatusCodes.CREATED);

      const cleanupResponse = await unauthorizedRequest
        .delete(categoriesRoutes.delete(id))
        .set(commonHeaders);

      expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);

      const searchResponse = await unauthorizedRequest
        .get(categoriesRoutes.getById(id))
        .set(commonHeaders);

      expect(searchResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('should respond with BAD_REQUEST status code in case of invalid id', async () => {
      const response = await unauthorizedRequest
        .delete(categoriesRoutes.delete('some-invalid-id'))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should respond with NOT_FOUND status code in case if category doesn't exist", async () => {
      const response = await unauthorizedRequest
        .delete(categoriesRoutes.delete(randomUUID))
        .set(commonHeaders);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should set article.categoryId to null after deletion', async () => {
      const creationCategoryResponse = await unauthorizedRequest
        .post(categoriesRoutes.create)
        .set(commonHeaders)
        .send(createCategoryDto);

      const { id: categoryId } = creationCategoryResponse.body;

      expect(creationCategoryResponse.status).toBe(StatusCodes.CREATED);

      const createArticleDto = {
        title: 'TEST_ARTICLE',
        content: 'Test content',
        status: 'draft',
        authorId: null,
        categoryId,
        tags: [],
      };

      const creationArticleResponse = await unauthorizedRequest
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send(createArticleDto);

      const { id: articleId } = creationArticleResponse.body;

      expect(creationArticleResponse.statusCode).toBe(StatusCodes.CREATED);

      const categoryDeletionResponse = await unauthorizedRequest
        .delete(categoriesRoutes.delete(categoryId))
        .set(commonHeaders);

      expect(categoryDeletionResponse.statusCode).toBe(StatusCodes.NO_CONTENT);

      const searchArticleResponse = await unauthorizedRequest
        .get(articlesRoutes.getById(articleId))
        .set(commonHeaders);

      expect(searchArticleResponse.statusCode).toBe(StatusCodes.OK);

      const { categoryId: articleCategoryId } = searchArticleResponse.body;

      expect(articleCategoryId).toBeNull();

      // Cleanup
      const cleanupArticle = await unauthorizedRequest
        .delete(articlesRoutes.delete(articleId))
        .set(commonHeaders);

      expect(cleanupArticle.statusCode).toBe(StatusCodes.NO_CONTENT);
    });
  });
});
