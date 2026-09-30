package com.aibus.service.gds;

import com.aibus.dto.gds.GdsSearchResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class GdsApiService {

    private final RestClient restClient;

    @Value("${aibus.access.token}")
    private String accessToken;

    public GdsApiService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://partnerapi.iamgds.com")
                .build();
    }

    public GdsSearchResponse searchBuses(
            int fromCityId,
            int toCityId,
            String journeyDate) {

        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/ota/Search")
                        .queryParam("fromCityId", fromCityId)
                        .queryParam("toCityId", toCityId)
                        .queryParam("journeyDate", journeyDate)
                        .build())
                .header("access-token", accessToken)
                .header("Accept-Encoding", "gzip")
                .retrieve()
                .body(GdsSearchResponse.class);
    }
}