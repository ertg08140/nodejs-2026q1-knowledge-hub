import { authRoutes } from '../endpoints';
import promoteUserRole from './promoteUserRole';

const getTokenAndUserId = async (request) => {
  // Unique login so repeated runs are not blocked by "Login already taken"
  const createUserDto = {
    login: `TEST_AUTH_LOGIN_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    password: 'Tu6!@#%&',
  };

  // create user (signup always yields a viewer per spec)
  const signupResponse = await request
    .post(authRoutes.signup)
    .set('Accept', 'application/json')
    .send(createUserDto);

  const mockUserId = signupResponse.body?.id as string | undefined;

  if (mockUserId === undefined) {
    throw new Error(
      `Signup did not return user id (status ${signupResponse.status}): ${JSON.stringify(signupResponse.body)}`,
    );
  }

  // promote directly in DB so base tests run as admin and can mutate
  await promoteUserRole(mockUserId, 'admin');

  // get token after promotion so the JWT payload role === 'admin'
  const loginResponse = await request
    .post(authRoutes.login)
    .set('Accept', 'application/json')
    .send(createUserDto);

  const { accessToken, refreshToken } = loginResponse.body ?? {};

  if (accessToken === undefined) {
    throw new Error(
      `Login did not return tokens (status ${loginResponse.status}): ${JSON.stringify(loginResponse.body)}`,
    );
  }

  const token = `Bearer ${accessToken}`;

  return {
    token,
    accessToken,
    refreshToken,
    mockUserId,
    login: createUserDto.login,
  };
};

export default getTokenAndUserId;
