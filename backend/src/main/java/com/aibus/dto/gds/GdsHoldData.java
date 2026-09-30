package com.aibus.dto.gds;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GdsHoldData {

    @JsonProperty("HoldId")
    private Long holdId;

    public Long getHoldId() {
        return holdId;
    }
}
