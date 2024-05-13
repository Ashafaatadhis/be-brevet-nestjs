import { number } from 'zod';

export class SearchUserRequest {
  search?: string;
  page: number;
  count: number;
}
