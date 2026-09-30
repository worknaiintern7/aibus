package com.aibus.service.gds;

import com.aibus.dto.bus.GdsBusDetailsResponse;
import com.aibus.dto.gds.GdsBus;
import com.aibus.dto.gds.GdsChartData;
import com.aibus.dto.gds.GdsSearchResponse;
import com.aibus.exception.ResourceNotFoundException;
import com.aibus.mapper.BusMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class GdsBusService {

    private final GdsApiService gdsApiService;
    private final BusMapper busMapper;

    public GdsBusService(GdsApiService gdsApiService, BusMapper busMapper) {
        this.gdsApiService = gdsApiService;
        this.busMapper = busMapper;
    }

    /**
     * A live bus with the provider ids that are needed to hold its seats.
     */
    public record GdsTrip(int fromCityId, int toCityId, boolean acBus, GdsBusDetailsResponse details) {
    }

    public GdsBusDetailsResponse getBusDetails(String source, String destination, LocalDate journeyDate, int busId) {
        return loadTrip(source, destination, journeyDate, busId).details();
    }

    public GdsTrip loadTrip(String source, String destination, LocalDate journeyDate, int busId) {
        if (!gdsApiService.isConfigured()) {
            throw new ResourceNotFoundException("Live buses are not available right now");
        }

        int fromCityId = gdsApiService.findCityId(source)
                .orElseThrow(() -> new ResourceNotFoundException("City not found: " + source));
        int toCityId = gdsApiService.findCityId(destination)
                .orElseThrow(() -> new ResourceNotFoundException("City not found: " + destination));

        GdsSearchResponse search = gdsApiService.searchBus(fromCityId, toCityId, journeyDate.toString(), busId);
        GdsBus bus = search == null || search.getData() == null || search.getData().getBuses() == null
                ? null
                : search.getData().getBuses().stream()
                        .filter(b -> b.getRouteBusId() == busId)
                        .findFirst()
                        .orElse(null);
        if (bus == null) {
            throw new ResourceNotFoundException("This bus is no longer available for " + journeyDate);
        }

        GdsChartData chart = gdsApiService.getChart(fromCityId, toCityId, journeyDate.toString(), busId);

        boolean acBus = bus.getBusType() != null && "AC".equalsIgnoreCase(bus.getBusType().getIsAc());
        GdsBusDetailsResponse details = busMapper.toGdsBusDetailsResponse(bus, chart, source, destination, journeyDate);
        return new GdsTrip(fromCityId, toCityId, acBus, details);
    }
}
