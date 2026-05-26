import { AxiosError } from "axios";

/**
 * Danh sÃƒÂ¡ch toÃƒÂ n bÃ¡Â»â„¢ Error Codes cÃ¡Â»Â§a hÃ¡Â»â€¡ thÃ¡Â»â€˜ng.
 * GiÃƒÂºp quÃ¡ÂºÂ£n lÃƒÂ½ thÃƒÂ´ng Ã„â€˜iÃ¡Â»â€¡p lÃ¡Â»â€”i tÃ¡ÂºÂ­p trung, dÃ¡Â»â€¦ dÃƒÂ ng thay Ã„â€˜Ã¡Â»â€¢i hoÃ¡ÂºÂ·c Ã„â€˜a ngÃƒÂ´n ngÃ¡Â»Â¯ sau nÃƒÂ y.
 */
export const ErrorCodes = {
  // LÃ¡Â»â€”i chung (General)
  INTERNAL_SERVER_ERROR: {
    code: "ERR_INTERNAL_001",
    message: "Ã„ÂÃƒÂ£ cÃƒÂ³ lÃ¡Â»â€”i xÃ¡ÂºÂ£y ra phÃƒÂ­a mÃƒÂ¡y chÃ¡Â»Â§",
    statusCode: 500,
  },
  BAD_REQUEST: {
    code: "ERR_BAD_REQUEST_001",
    message:
      "D\u1eef li\u1ec7u y\u00eau c\u1ea7u kh\u00f4ng h\u1ee3p l\u1ec7",
    statusCode: 400,
  },
  UNAUTHORIZED: {
    code: "ERR_UNAUTHORIZED_001",
    message: "PhiÃƒÂªn Ã„â€˜Ã„Æ’ng nhÃ¡ÂºÂ­p Ã„â€˜ÃƒÂ£ hÃ¡ÂºÂ¿t hÃ¡ÂºÂ¡n hoÃ¡ÂºÂ·c khÃƒÂ´ng hÃ¡Â»Â£p lÃ¡Â»â€¡",
    statusCode: 401,
  },
  FORBIDDEN: {
    code: "ERR_FORBIDDEN_001",
    message: "BÃ¡ÂºÂ¡n khÃƒÂ´ng cÃƒÂ³ quyÃ¡Â»Ân thÃ¡Â»Â±c hiÃ¡Â»â€¡n hÃƒÂ nh Ã„â€˜Ã¡Â»â„¢ng nÃƒÂ y",
    statusCode: 403,
  },
  NOT_FOUND: {
    code: "ERR_NOT_FOUND_001",
    message: "KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y tÃƒÂ i nguyÃƒÂªn yÃƒÂªu cÃ¡ÂºÂ§u",
    statusCode: 404,
  },

  // LÃ¡Â»â€”i liÃƒÂªn quan Ã„â€˜Ã¡ÂºÂ¿n Database/Sequelize
  DATABASE_ERROR: {
    code: "ERR_DB_001",
    message: "LÃ¡Â»â€”i kÃ¡ÂºÂ¿t nÃ¡Â»â€˜i cÃ†Â¡ sÃ¡Â»Å¸ dÃ¡Â»Â¯ liÃ¡Â»â€¡u",
    statusCode: 500,
  },
  DUPLICATE_ENTRY: {
    code: "ERR_DB_002",
    message: "DÃ¡Â»Â¯ liÃ¡Â»â€¡u Ã„â€˜ÃƒÂ£ tÃ¡Â»â€œn tÃ¡ÂºÂ¡i trong hÃ¡Â»â€¡ thÃ¡Â»â€˜ng",
    statusCode: 409,
  },

  // LÃ¡Â»â€”i liÃƒÂªn quan Ã„â€˜Ã¡ÂºÂ¿n Auth
  AUTH_INVALID_CREDENTIALS: {
    code: "ERR_AUTH_001",
    message: "Email hoÃ¡ÂºÂ·c mÃ¡ÂºÂ­t khÃ¡ÂºÂ©u khÃƒÂ´ng chÃƒÂ­nh xÃƒÂ¡c",
    statusCode: 401,
  },
  AUTH_EMAIL_TAKEN: {
    code: "ERR_AUTH_002",
    message: "Email Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c sÃ¡Â»Â­ dÃ¡Â»Â¥ng",
    statusCode: 400,
  },
  AUTH_FORBIDDEN_CLIENT: {
    code: "ERR_AUTH_003",
    message: "TÃƒÂ i khoÃ¡ÂºÂ£n cÃ¡Â»Â§a bÃ¡ÂºÂ¡n khÃƒÂ´ng cÃƒÂ³ quyÃ¡Â»Ân truy cÃ¡ÂºÂ­p vÃƒÂ o hÃ¡Â»â€¡ thÃ¡Â»â€˜ng nÃƒÂ y",
    statusCode: 403,
  },

  USER_NOT_FOUND: {
    code: "ERR_USER_001",
    message: "KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y ngÃ†Â°Ã¡Â»Âi dÃƒÂ¹ng",
    statusCode: 400,
  },
  COMPANY_NOT_FOUND: {
    code: "ERR_COMPANY_001",
    message: "KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y cÃƒÂ´ng ty",
    statusCode: 404,
  },
  TOKEN_PIN_ERROR: {
    code: "TOKEN_PIN_ERROR",
    message:
      "M\u00e3 PIN USB Token kh\u00f4ng \u0111\u00fang, token \u0111\u00e3 b\u1ecb kh\u00f3a ho\u1eb7c driver k\u00fd s\u1ed1 t\u1eeb ch\u1ed1i. Vui l\u00f2ng ki\u1ec3m tra l\u1ea1i m\u00e3 PIN v\u00e0 tr\u1ea1ng th\u00e1i USB Token.",
    statusCode: 401,
  },
} as const;

// BÃ¡ÂºÂ£n Ã„â€˜Ã¡Â»â€œ tra cÃ¡Â»Â©u nhanh message tÃ¡Â»Â« code string (vÃƒÂ­ dÃ¡Â»Â¥: "ERR_AUTH_001")
const ERROR_CODE_TO_MESSAGE: Record<string, string> = Object.values(
  ErrorCodes,
).reduce(
  (acc, item) => {
    acc[item.code] = item.message;
    return acc;
  },
  {} as Record<string, string>,
);

// BÃ¡ÂºÂ£n Ã„â€˜Ã¡Â»â€œ tra cÃ¡Â»Â©u nhanh message tÃ¡Â»Â« HTTP Status Code
const HTTP_STATUS_TO_MESSAGE: Record<number, string> = {
  400: ErrorCodes.BAD_REQUEST.message,
  401: ErrorCodes.UNAUTHORIZED.message,
  403: ErrorCodes.FORBIDDEN.message,
  404: ErrorCodes.NOT_FOUND.message,
  409: ErrorCodes.DUPLICATE_ENTRY.message,
  500: ErrorCodes.INTERNAL_SERVER_ERROR.message,
};

/**
 * ChuyÃ¡Â»Æ’n Ã„â€˜Ã¡Â»â€¢i mÃƒÂ£ lÃ¡Â»â€”i hoÃ¡ÂºÂ·c message tÃ¡Â»Â« API sang thÃƒÂ´ng Ã„â€˜iÃ¡Â»â€¡p tiÃ¡ÂºÂ¿ng ViÃ¡Â»â€¡t thÃƒÂ¢n thiÃ¡Â»â€¡n.
 */
export function translateErrorMessage(
  code: unknown,
  message?: string | null,
): string {
  // 1. Ã†Â¯u tiÃƒÂªn tra cÃ¡Â»Â©u theo mÃƒÂ£ lÃ¡Â»â€”i chuÃ¡Â»â€”i (vÃƒÂ­ dÃ¡Â»Â¥: "ERR_AUTH_001")
  if (typeof code === "string" && code in ERROR_CODE_TO_MESSAGE) {
    return ERROR_CODE_TO_MESSAGE[code];
  }

  // 2. Tra cÃ¡Â»Â©u theo HTTP Status Code (number)
  if (typeof code === "number" && code in HTTP_STATUS_TO_MESSAGE) {
    return HTTP_STATUS_TO_MESSAGE[code];
  }

  // 3. NÃ¡ÂºÂ¿u khÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y mÃƒÂ£, dÃƒÂ¹ng message trÃ¡ÂºÂ£ vÃ¡Â»Â tÃ¡Â»Â« API (nÃ¡ÂºÂ¿u cÃƒÂ³)
  if (message && message.trim()) {
    return message;
  }

  // 4. MÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹nh
  return ErrorCodes.INTERNAL_SERVER_ERROR.message;
}

/**
 * TrÃƒÂ­ch xuÃ¡ÂºÂ¥t thÃƒÂ´ng Ã„â€˜iÃ¡Â»â€¡p lÃ¡Â»â€”i tÃ¡Â»Â« Axios Error.
 */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    const status = error.response?.status;

    // Ã†Â¯u tiÃƒÂªn lÃ¡ÂºÂ¥y mÃƒÂ£ lÃ¡Â»â€”i (error_code) vÃƒÂ  message tÃ¡Â»Â« payload response
    const errorCode = data?.error_code || data?.errorCode || data?.code;
    const apiMessage = data?.message;

    // NÃ¡ÂºÂ¿u khÃƒÂ´ng cÃƒÂ³ errorCode Ã„â€˜Ã¡ÂºÂ·c biÃ¡Â»â€¡t, thÃ¡Â»Â­ dÃƒÂ¹ng HTTP status code
    return translateErrorMessage(errorCode || status, apiMessage);
  }

  if (error instanceof Error) return error.message;

  return "KhÃƒÂ´ng thÃ¡Â»Æ’ kÃ¡ÂºÂ¿t nÃ¡Â»â€˜i Ã„â€˜Ã¡ÂºÂ¿n mÃƒÂ¡y chÃ¡Â»Â§. Vui lÃƒÂ²ng thÃ¡Â»Â­ lÃ¡ÂºÂ¡i.";
}
