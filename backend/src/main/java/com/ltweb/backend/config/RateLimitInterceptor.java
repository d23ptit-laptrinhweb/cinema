package com.ltweb.backend.config;

import com.ltweb.backend.exception.AppException;
import com.ltweb.backend.exception.ErrorCode;
import com.ltweb.backend.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {
    private static final String LOGIN_PATH = "/auth/login";
    private static final String REFRESH_PATH = "/auth/refresh";

    private static final long LOGIN_MAX_REQUESTS = 5;
    private static final long LOGIN_WINDOW_SECONDS = 60;

    private static final long REFRESH_MAX_REQUESTS = 20;
    private static final long REFRESH_WINDOW_SECONDS = 60;

    private final RateLimitService rateLimitService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String requestPath = request.getRequestURI();
        String method = request.getMethod();

        if (!"POST".equalsIgnoreCase(method)) {
            return true;
        }

        String clientIp = extractClientIp(request);

        if (requestPath.endsWith(LOGIN_PATH)) {
            String key = "rl:login:" + clientIp;
            boolean isAllowed = rateLimitService.isAllowed(key, LOGIN_MAX_REQUESTS, LOGIN_WINDOW_SECONDS);
            if (!isAllowed) {
                throw new AppException(ErrorCode.TOO_MANY_REQUESTS);
            }
        }

        if (requestPath.endsWith(REFRESH_PATH)) {
            String key = "rl:refresh:" + clientIp;
            boolean isAllowed = rateLimitService.isAllowed(key, REFRESH_MAX_REQUESTS, REFRESH_WINDOW_SECONDS);
            if (!isAllowed) {
                throw new AppException(ErrorCode.TOO_MANY_REQUESTS);
            }
        }

        return true;
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }

        return request.getRemoteAddr();
    }
}
