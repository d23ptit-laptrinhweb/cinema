package com.ltweb.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RateLimitService {
    private static final String INCREMENT_AND_EXPIRE_SCRIPT = """
            local current = redis.call('INCR', KEYS[1])
            if current == 1 then
              redis.call('EXPIRE', KEYS[1], ARGV[1])
            end
            return current
            """;

    private final StringRedisTemplate redisTemplate;

    public boolean isAllowed(String key, long maxRequests, long windowSeconds) {
        if (maxRequests <= 0 || windowSeconds <= 0) {
            return true;
        }

        DefaultRedisScript<Long> script = new DefaultRedisScript<>();
        script.setScriptText(INCREMENT_AND_EXPIRE_SCRIPT);
        script.setResultType(Long.class);

        List<String> keys = Collections.singletonList(key);
        Long current = redisTemplate.execute(script, keys, String.valueOf(windowSeconds));

        if (current == null) {
            return true;
        }

        return current <= maxRequests;
    }
}
