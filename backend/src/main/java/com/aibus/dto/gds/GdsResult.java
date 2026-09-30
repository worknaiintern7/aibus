package com.aibus.dto.gds;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Common GDS envelope: { "success": true, "data": {...} } or
 * { "success": false, "Error": { "Code": 605, "Msg": "..." }, "error": "ERR605:CODE:Readable text:Event_Id=..." }
 */
public class GdsResult<T> {

    private boolean success;
    private T data;

    @JsonProperty("Error")
    private GdsError error;

    @JsonProperty("error")
    private String errorText;

    public GdsResult() {
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public GdsError getError() {
        return error;
    }

    public String getErrorText() {
        return errorText;
    }

    public static class GdsError {

        @JsonProperty("Code")
        private Integer code;

        @JsonProperty("Msg")
        private String msg;

        public Integer getCode() {
            return code;
        }

        public String getMsg() {
            return msg;
        }
    }
}
