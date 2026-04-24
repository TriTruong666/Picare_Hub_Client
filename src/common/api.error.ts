import { AxiosError } from "axios";

/**
 * Danh sách toàn bộ Error Codes của hệ thống.
 * Giúp quản lý thông điệp lỗi tập trung, dễ dàng thay đổi hoặc đa ngôn ngữ sau này.
 */
export const ErrorCodes = {
  // Lỗi chung (General)
  INTERNAL_SERVER_ERROR: {
    code: "ERR_INTERNAL_001",
    message: "Đã có lỗi xảy ra phía máy chủ",
    statusCode: 500,
  },
  BAD_REQUEST: {
    code: "ERR_BAD_REQUEST_001",
    message: "Dữ liệu yêu cầu không hợp lệ",
    statusCode: 400,
  },
  UNAUTHORIZED: {
    code: "ERR_UNAUTHORIZED_001",
    message: "Phiên đăng nhập đã hết hạn hoặc không hợp lệ",
    statusCode: 401,
  },
  FORBIDDEN: {
    code: "ERR_FORBIDDEN_001",
    message: "Bạn không có quyền thực hiện hành động này",
    statusCode: 403,
  },
  NOT_FOUND: {
    code: "ERR_NOT_FOUND_001",
    message: "Không tìm thấy tài nguyên yêu cầu",
    statusCode: 404,
  },

  // Lỗi liên quan đến Database/Sequelize
  DATABASE_ERROR: {
    code: "ERR_DB_001",
    message: "Lỗi kết nối cơ sở dữ liệu",
    statusCode: 500,
  },
  DUPLICATE_ENTRY: {
    code: "ERR_DB_002",
    message: "Dữ liệu đã tồn tại trong hệ thống",
    statusCode: 409,
  },

  // Lỗi liên quan đến Auth
  AUTH_INVALID_CREDENTIALS: {
    code: "ERR_AUTH_001",
    message: "Email hoặc mật khẩu không chính xác",
    statusCode: 401,
  },
  AUTH_EMAIL_TAKEN: {
    code: "ERR_AUTH_002",
    message: "Email đã được sử dụng",
    statusCode: 400,
  },
  AUTH_FORBIDDEN_CLIENT: {
    code: "ERR_AUTH_003",
    message: "Tài khoản của bạn không có quyền truy cập vào hệ thống này",
    statusCode: 403,
  },

  USER_NOT_FOUND: {
    code: "ERR_USER_001",
    message: "Không tìm thấy người dùng",
    statusCode: 400,
  },
  COMPANY_NOT_FOUND: {
    code: "ERR_COMPANY_001",
    message: "Không tìm thấy công ty",
    statusCode: 404,
  },
} as const;

// Bản đồ tra cứu nhanh message từ code string (ví dụ: "ERR_AUTH_001")
const ERROR_CODE_TO_MESSAGE: Record<string, string> = Object.values(
  ErrorCodes,
).reduce(
  (acc, item) => {
    acc[item.code] = item.message;
    return acc;
  },
  {} as Record<string, string>,
);

// Bản đồ tra cứu nhanh message từ HTTP Status Code
const HTTP_STATUS_TO_MESSAGE: Record<number, string> = {
  400: ErrorCodes.BAD_REQUEST.message,
  401: ErrorCodes.UNAUTHORIZED.message,
  403: ErrorCodes.FORBIDDEN.message,
  404: ErrorCodes.NOT_FOUND.message,
  409: ErrorCodes.DUPLICATE_ENTRY.message,
  500: ErrorCodes.INTERNAL_SERVER_ERROR.message,
};

/**
 * Chuyển đổi mã lỗi hoặc message từ API sang thông điệp tiếng Việt thân thiện.
 */
export function translateErrorMessage(
  code: unknown,
  message?: string | null,
): string {
  // 1. Ưu tiên tra cứu theo mã lỗi chuỗi (ví dụ: "ERR_AUTH_001")
  if (typeof code === "string" && code in ERROR_CODE_TO_MESSAGE) {
    return ERROR_CODE_TO_MESSAGE[code];
  }

  // 2. Tra cứu theo HTTP Status Code (number)
  if (typeof code === "number" && code in HTTP_STATUS_TO_MESSAGE) {
    return HTTP_STATUS_TO_MESSAGE[code];
  }

  // 3. Nếu không tìm thấy mã, dùng message trả về từ API (nếu có)
  if (message && message.trim()) {
    return message;
  }

  // 4. Mặc định
  return ErrorCodes.INTERNAL_SERVER_ERROR.message;
}

/**
 * Trích xuất thông điệp lỗi từ Axios Error.
 */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    const status = error.response?.status;

    // Ưu tiên lấy mã lỗi (error_code) và message từ payload response
    const errorCode = data?.error_code || data?.code;
    const apiMessage = data?.message;

    // Nếu không có errorCode đặc biệt, thử dùng HTTP status code
    return translateErrorMessage(errorCode || status, apiMessage);
  }

  if (error instanceof Error) return error.message;

  return "Không thể kết nối đến máy chủ. Vui lòng thử lại.";
}