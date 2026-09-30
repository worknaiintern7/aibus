package com.aibus.service.gds;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Generates the GDS access token from ClientId / ClientSecret and caches it,
 * so no token has to be pasted into configuration by hand.
 */
@Service
public class GdsTokenService {

    private static final Logger log = LoggerFactory.getLogger(GdsTokenService.class);

    private static final String DEFAULT_AUTH_URL = "https://partnerapi.iamgds.com/ota/v1/Auth";

    /*
     * Mantis tokens are valid for 90 minutes. We refresh every 80 minutes
     * or on 401 via invalidate().
     */
    private static final Duration TOKEN_TTL = Duration.ofMinutes(80);

    private final RestClient restClient;
    private final String authUrl;
    private final String clientId;
    private final String clientSecret;

    private String token;
    private Instant expiresAt = Instant.MIN;

    public GdsTokenService(
            @Value("${aibus.auth.url:}") String authUrl,
            @Value("${aibus.client.id:}") String clientId,
            @Value("${aibus.client.secret:}") String clientSecret) {
        this.restClient = RestClient.builder()
                .requestFactory(GdsApiService.requestFactory(Duration.ofSeconds(20)))
                .build();
        this.authUrl = authUrl == null || authUrl.isBlank() ? DEFAULT_AUTH_URL : authUrl.trim();
        this.clientId = clientId == null ? "" : clientId.trim();
        this.clientSecret = clientSecret == null ? "" : clientSecret.trim();
    }

    public boolean isConfigured() {
        return !clientId.isEmpty() && !clientSecret.isEmpty();
    }

    public synchronized String getToken() {
        if (token == null || Instant.now().isAfter(expiresAt)) {
            token = requestToken();
            expiresAt = Instant.now().plus(TOKEN_TTL);
            log.info("GDS access token generated");
        }
        return token;
    }

    /**
     * Drops the cached token if it is still the one that was rejected,
     * so the next getToken() call generates a new one.
     */
    public synchronized void invalidate(String rejectedToken) {
        if (rejectedToken != null && rejectedToken.equals(token)) {
            token = null;
        }
    }

    private String requestToken() {
        if (!isConfigured()) {
            throw new IllegalStateException(
                    "GDS credentials are missing. Set AIBUS_CLIENT_ID and AIBUS_CLIENT_SECRET.");
        }

        Map<String, Object> request = new LinkedHashMap<>();
        request.put("ClientId", Integer.valueOf(clientId));
        request.put("ClientSecret", clientSecret);

        // The Auth API returns the token as a bare JSON string: "XXXX|50-S|...||FFFF"
        String body = restClient.post()
                .uri(authUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(String.class);

        String value = body == null ? "" : body.trim();
        if (value.length() >= 2 && value.startsWith("\"") && value.endsWith("\"")) {
            value = value.substring(1, value.length() - 1);
        }
        if (value.isEmpty()) {
            throw new IllegalStateException("GDS Auth API returned an empty access token");
        }
        return value;
    }
}
