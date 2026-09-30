package com.aibus.exception;

/**
 * The GDS provider answered, but rejected the request (success = false).
 */
public class GdsApiException extends RuntimeException {

    private final Integer code;

    public GdsApiException(String message, Integer code) {
        super(message);
        this.code = code;
    }

    public Integer getCode() {
        return code;
    }
}
