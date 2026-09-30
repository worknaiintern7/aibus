package com.aibus.service.gds;

import com.aibus.dto.gds.GdsBookData;
import com.aibus.dto.gds.GdsBookingStatusData;
import com.aibus.dto.gds.GdsCancelData;
import com.aibus.dto.gds.GdsCancellableData;
import com.aibus.dto.gds.GdsChartData;
import com.aibus.dto.gds.GdsCityListResponse;
import com.aibus.dto.gds.GdsHoldData;
import com.aibus.dto.gds.GdsResult;
import com.aibus.dto.gds.GdsSearchResponse;
import com.aibus.exception.GdsApiException;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriBuilder;

import java.net.URI;
import java.net.http.HttpClient;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

@Service
public class GdsApiService {

    private static final Duration CITY_CACHE_TTL = Duration.ofHours(24);

    // Read API: cities, search, seat chart
    private final RestClient readClient;
    // Transaction API: hold, book, booking status, cancel
    private final RestClient tranClient;
    private final GdsTokenService tokenService;

    private volatile Map<String, Integer> cityIdsByName = Map.of();
    private volatile java.util.List<GdsCityListResponse.GdsCity> allCitiesList = java.util.List.of();
    private volatile Instant citiesLoadedAt = Instant.MIN;

    public GdsApiService(GdsTokenService tokenService) {
        this.tokenService = tokenService;
        this.readClient = RestClient.builder()
                .baseUrl("https://partnerapi.iamgds.com")
                .requestFactory(requestFactory(Duration.ofSeconds(20)))
                .build();
        this.tranClient = RestClient.builder()
                .baseUrl("https://partnertranapi.iamgds.com")
                .requestFactory(requestFactory(Duration.ofSeconds(45)))
                .build();
    }

    static ClientHttpRequestFactory requestFactory(Duration readTimeout) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(readTimeout);
        return factory;
    }

    public boolean isConfigured() {
        return tokenService.isConfigured();
    }

    // ------------------------------------------------------------------
    // Read API
    // ------------------------------------------------------------------

    public GdsSearchResponse searchBuses(
            int fromCityId,
            int toCityId,
            String journeyDate) {

        return exchange(readClient, HttpMethod.GET, uriBuilder -> uriBuilder
                        .path("/ota/Search")
                        .queryParam("fromCityId", fromCityId)
                        .queryParam("toCityId", toCityId)
                        .queryParam("journeyDate", journeyDate)
                        .build(),
                null,
                new ParameterizedTypeReference<GdsSearchResponse>() {
                });
    }

    /**
     * One bus of a route, with the same details as the search result.
     */
    public GdsSearchResponse searchBus(
            int fromCityId,
            int toCityId,
            String journeyDate,
            int busId) {

        return exchange(readClient, HttpMethod.GET, uriBuilder -> uriBuilder
                        .path("/ota/SearchBus")
                        .queryParam("fromCityId", fromCityId)
                        .queryParam("toCityId", toCityId)
                        .queryParam("journeyDate", journeyDate)
                        .queryParam("busId", busId)
                        .build(),
                null,
                new ParameterizedTypeReference<GdsSearchResponse>() {
                });
    }

    /**
     * Seat layout, seat status, per-seat fares, pickups and dropoffs of a bus.
     */
    public GdsChartData getChart(
            int fromCityId,
            int toCityId,
            String journeyDate,
            int busId) {

        return requireData(exchange(readClient, HttpMethod.GET, uriBuilder -> uriBuilder
                        .path("/ota/Chart")
                        .queryParam("fromCityId", fromCityId)
                        .queryParam("toCityId", toCityId)
                        .queryParam("journeyDate", journeyDate)
                        .queryParam("busId", busId)
                        .build(),
                null,
                new ParameterizedTypeReference<GdsResult<GdsChartData>>() {
                }));
    }

    /**
     * Resolves a city name (e.g. "Pune", "Bengaluru") to its GDS CityId.
     * The city list is fetched once and kept for 24 hours.
     */
    public Optional<Integer> findCityId(String cityName) {
        if (cityName == null || cityName.isBlank()) {
            return Optional.empty();
        }
        ensureCitiesLoaded();
        return Optional.ofNullable(cityIdsByName.get(cityName.trim().toLowerCase()));
    }

    public java.util.List<Map<String, Object>> searchCities(String query) {
        ensureCitiesLoaded();
        String q = query == null ? "" : query.trim().toLowerCase();
        return allCitiesList.stream()
                .filter(c -> q.isEmpty() || (c.getCity() != null && c.getCity().toLowerCase().contains(q)))
                .limit(40)
                .map(c -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("cityId", c.getCityId());
                    map.put("city", c.getCity());
                    map.put("state", c.getState() != null ? c.getState() : "");
                    return map;
                })
                .toList();
    }

    private void ensureCitiesLoaded() {
        if (isCityCacheStale()) {
            synchronized (this) {
                if (isCityCacheStale()) {
                    GdsCityListResponse response = exchange(readClient, HttpMethod.GET,
                            uriBuilder -> uriBuilder.path("/ota/CityList").build(),
                            null,
                            new ParameterizedTypeReference<GdsCityListResponse>() {
                            });

                    Map<String, Integer> loaded = new HashMap<>();
                    java.util.List<GdsCityListResponse.GdsCity> rawList = java.util.List.of();
                    if (response != null && response.getData() != null) {
                        rawList = response.getData();
                        for (GdsCityListResponse.GdsCity city : rawList) {
                            if (city.getCity() != null) {
                                // Several names can share a CityId (Bangalore / Bengaluru).
                                loaded.putIfAbsent(city.getCity().trim().toLowerCase(), city.getCityId());
                            }
                        }
                    }
                    allCitiesList = rawList;
                    cityIdsByName = loaded;
                    citiesLoadedAt = Instant.now();
                }
            }
        }
    }

    private boolean isCityCacheStale() {
        return cityIdsByName.isEmpty()
                || Instant.now().isAfter(citiesLoadedAt.plus(CITY_CACHE_TTL));
    }

    // ------------------------------------------------------------------
    // Transaction API
    // ------------------------------------------------------------------

    /**
     * Holds the seats for a short time. Returns the HoldId needed by bookSeats().
     */
    public long holdSeats(Map<String, Object> holdRequest) {
        GdsHoldData data = requireData(exchange(tranClient, HttpMethod.POST,
                uriBuilder -> uriBuilder.path("/ota/HoldSeats").build(),
                holdRequest,
                new ParameterizedTypeReference<GdsResult<GdsHoldData>>() {
                }));
        if (data.getHoldId() == null) {
            throw new GdsApiException("Seats could not be held", null);
        }
        return data.getHoldId();
    }

    /**
     * Books previously held seats. Returns the operator PNR and the ticket number.
     */
    public GdsBookData bookSeats(long holdId) {
        return requireData(exchange(tranClient, HttpMethod.POST,
                uriBuilder -> uriBuilder.path("/ota/BookSeats").build(),
                Map.of("HoldId", holdId),
                new ParameterizedTypeReference<GdsResult<GdsBookData>>() {
                }));
    }

    /**
     * To be used when bookSeats() did not give a clear answer.
     */
    public GdsBookingStatusData getBookingStatus(long holdId) {
        return requireData(exchange(tranClient, HttpMethod.POST,
                uriBuilder -> uriBuilder.path("/ota/bookingstatusv2").build(),
                Map.of("HoldId", holdId),
                new ParameterizedTypeReference<GdsResult<GdsBookingStatusData>>() {
                }));
    }

    public GdsCancellableData isCancellable(String pnrNo, String ticketNo, String seatNos) {
        return requireData(exchange(tranClient, HttpMethod.GET, uriBuilder -> uriBuilder
                        .path("/ota/IsCancellable")
                        .queryParam("PNRNo", pnrNo)
                        .queryParam("TicketNo", ticketNo)
                        .queryParam("seatNos", seatNos)
                        .build(),
                null,
                new ParameterizedTypeReference<GdsResult<GdsCancellableData>>() {
                }));
    }

    public GdsCancelData cancelSeats(String pnrNo, String ticketNo, String seatNos) {
        Map<String, Object> request = new HashMap<>();
        request.put("PNR", pnrNo);
        request.put("TicketNo", ticketNo);
        request.put("SeatNos", seatNos);

        return requireData(exchange(tranClient, HttpMethod.POST,
                uriBuilder -> uriBuilder.path("/ota/CancelSeats").build(),
                request,
                new ParameterizedTypeReference<GdsResult<GdsCancelData>>() {
                }));
    }

    /**
     * Agent balance from Transaction API.
     */
    public Map<String, Object> getAgentBalance() {
        return requireData(exchange(tranClient, HttpMethod.GET,
                uriBuilder -> uriBuilder.path("/ota/balance").build(),
                null,
                new ParameterizedTypeReference<GdsResult<Map<String, Object>>>() {
                }));
    }

    /**
     * Booking details by PNR and Ticket number from Transaction API.
     */
    public Map<String, Object> getBookingDetails(String pnr, String ticketNo) {
        return requireData(exchange(tranClient, HttpMethod.GET,
                uriBuilder -> uriBuilder.path("/ota/BookingDetails")
                        .queryParam("PNR", pnr)
                        .queryParam("TicketNo", ticketNo)
                        .build(),
                null,
                new ParameterizedTypeReference<GdsResult<Map<String, Object>>>() {
                }));
    }

    // ------------------------------------------------------------------

    private <T> T requireData(GdsResult<T> result) {
        if (result == null) {
            throw new GdsApiException("The bus provider returned an empty response", null);
        }
        if (!result.isSuccess() || result.getData() == null) {
            Integer code = result.getError() != null ? result.getError().getCode() : null;
            throw new GdsApiException(readableError(result), code);
        }
        return result.getData();
    }

    // "ERR605:INVALID_TICKET_DETAILS:Sorry! We could not find the provided ticket.:Event_Id=..."
    private String readableError(GdsResult<?> result) {
        String text = result.getErrorText();
        if (text != null) {
            String[] parts = text.split(":", 4);
            if (parts.length >= 3 && !parts[2].isBlank()) {
                return parts[2].trim();
            }
        }
        if (result.getError() != null && result.getError().getMsg() != null) {
            return "The bus provider rejected the request (" + result.getError().getMsg() + ")";
        }
        return "The bus provider rejected the request";
    }

    /*
     * Every API needs the access-token header. If GDS rejects the cached token
     * (401, the request was not processed), a new one is generated and the call
     * is repeated once.
     */
    private <T> T exchange(
            RestClient client,
            HttpMethod method,
            Function<UriBuilder, URI> uri,
            Object body,
            ParameterizedTypeReference<T> responseType) {

        String token = tokenService.getToken();
        try {
            return exchange(client, method, uri, body, token, responseType);
        } catch (HttpClientErrorException.Unauthorized ex) {
            tokenService.invalidate(token);
            return exchange(client, method, uri, body, tokenService.getToken(), responseType);
        }
    }

    private <T> T exchange(
            RestClient client,
            HttpMethod method,
            Function<UriBuilder, URI> uri,
            Object body,
            String token,
            ParameterizedTypeReference<T> responseType) {

        RestClient.RequestBodySpec request = client.method(method)
                .uri(uri)
                .header("access-token", token);
        if (body != null) {
            request.contentType(MediaType.APPLICATION_JSON).body(body);
        }
        return request.retrieve().body(responseType);
    }
}
