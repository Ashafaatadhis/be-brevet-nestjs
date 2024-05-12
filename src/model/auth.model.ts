export class RegisterUserRequest {
  username: string;
  fullname: string;
  email: string;
  password: string;
  confirmPassword: string;
}
export class LoginUserRequest {
  username: string;
  password: string;
}

export class UserResponse {
  id: string;
  email: string;
  fullname: string;
  username: string;
  provider: string;
  image: string;
  phoneNumber: string;
  role: string;
  golongan: string;
  NPM: string;
  createdAt: Date;
}

export class RefreshResponse {
  success?: boolean;
  accessToken: string;
}

export class LogoutResponse {
  success: boolean;
}
