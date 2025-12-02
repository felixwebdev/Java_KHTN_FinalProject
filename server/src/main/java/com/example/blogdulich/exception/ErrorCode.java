package com.example.blogdulich.exception;

public enum ErrorCode {
    USER_NOT_FOUND(1004, "User not found"),
    INVALID_PASSWORD(1002, "Password must be at least 8 character!"),
    USER_EXISTED(1003, "User existed"),
    UNCATEGORIZED_EXCEPTION(1004, "Uncategorized exception"),
    UNAUTHENTICATED(1005, "Unauthenticated"),
    BLOG_NOT_FOUND(1004, "Blog is not found")
    ;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    private int code;
    private String message;

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
