export interface ApiResponse<T> {
 ok: boolean;
 data: T;
}

export interface ApiError {
 ok: false;
 error: { code: string; message: string };
}
