export class WebResponse<T> {
  success: boolean;
  data: T;
  accessToken?: string;
  errors?: string;
}
