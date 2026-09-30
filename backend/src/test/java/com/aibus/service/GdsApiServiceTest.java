package com.aibus.service;

import com.aibus.dto.gds.*;
import com.aibus.service.gds.GdsApiService;
import com.aibus.service.gds.GdsTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GdsApiServiceTest {

    @Mock
    private GdsTokenService tokenService;

    private GdsApiService gdsApiService;

    @BeforeEach
    void setUp() {
        gdsApiService = new GdsApiService(tokenService);
    }

    @Test
    void isConfigured_ShouldDelegateToTokenService() {
        when(tokenService.isConfigured()).thenReturn(true);
        assertTrue(gdsApiService.isConfigured());

        when(tokenService.isConfigured()).thenReturn(false);
        assertFalse(gdsApiService.isConfigured());
    }

    @Test
    void findCityId_EmptyCity_ShouldReturnEmptyOptional() {
        Optional<Integer> result = gdsApiService.findCityId("");
        assertTrue(result.isEmpty());

        result = gdsApiService.findCityId(null);
        assertTrue(result.isEmpty());
    }

    @Test
    void tokenService_WhenNotConfigured_ThrowsIllegalStateException() {
        GdsTokenService unconfiguredTokenService = new GdsTokenService("", "", "");
        assertFalse(unconfiguredTokenService.isConfigured());
        assertThrows(IllegalStateException.class, unconfiguredTokenService::getToken);
    }
}
