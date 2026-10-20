export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: string;
}

export class AuthService {
  private readonly defaultUser: User = {
    id: 'user_dev_01',
    email: 'developer@workflow.ai',
    name: 'Developer',
    role: 'admin',
  };

  getCurrentUser(): User {
    return this.defaultUser;
  }

  login(credentials?: any) {
    return {
      token: 'dev_token_office_weave_2026',
      user: {
        ...this.defaultUser,
        email: credentials?.email || this.defaultUser.email,
      },
    };
  }

  register(data?: any) {
    return {
      token: 'dev_token_office_weave_2026',
      user: {
        id: `user_${Date.now()}`,
        email: data?.email || 'new_user@workflow.ai',
        name: data?.name || 'New User',
        role: 'user',
      },
    };
  }
}

export const authService = new AuthService();
