package com.aibus.dto.admin.schedule;

import com.aibus.entity.ScheduleStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateScheduleStatusRequest {

    @NotNull(message = "Schedule status is required")
    private ScheduleStatus status;

    public UpdateScheduleStatusRequest() {
    }

    public UpdateScheduleStatusRequest(ScheduleStatus status) {
        this.status = status;
    }

    public ScheduleStatus getStatus() {
        return status;
    }

    public void setStatus(ScheduleStatus status) {
        this.status = status;
    }
}
