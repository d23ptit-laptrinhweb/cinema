package com.ltweb.backend.service;

import com.ltweb.backend.dto.JwtInfo;
import com.ltweb.backend.dto.TokenPayload;
import com.ltweb.backend.dto.request.LoginRequest;
import com.ltweb.backend.dto.response.LoginResponse;
import com.ltweb.backend.entity.RedisToken;
import com.ltweb.backend.entity.User;
import com.ltweb.backend.exception.AppException;
import com.ltweb.backend.exception.ErrorCode;
import com.ltweb.backend.repository.RedisTokenRepository;
import com.ltweb.backend.repository.UserRepository;
import com.nimbusds.jwt.SignedJWT;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RedisTokenRepository redisTokenRepository;
    private final UserRepository userRepository;

    public LoginResponse login(LoginRequest  loginRequest) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword());
        Authentication authentication = authenticationManager.authenticate(authenticationToken);

        User user = (User) authentication.getPrincipal();

        return getLoginResponse(user);
    }

    public void logout(String token) {
        JwtInfo jwtInfo = jwtService.parseToken(token);
        String jwtId = jwtInfo.getJwtId();
        Date expiredTime = jwtInfo.getExpiresTime();
        if(expiredTime.before(new Date())) {
            return;
        }
        long remainingMillis = expiredTime.getTime() - System.currentTimeMillis();
        long ttlSeconds = toTtlSeconds(remainingMillis);
        RedisToken redisToken = new RedisToken(jwtId, ttlSeconds);
        redisTokenRepository.save(redisToken);
    }

    private long toTtlSeconds(long remainingMillis) {
        if (remainingMillis <= 0) {
            return 0L;
        }
        return (remainingMillis + 999L) / TimeUnit.SECONDS.toMillis(1);
    }

    public LoginResponse refresh(String token) {
        SignedJWT signedJWT;
        try {
            signedJWT = SignedJWT.parse(token);
        } catch (java.text.ParseException e) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        if (!jwtService.verifyRefreshToken(token)) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        String username;
        try {
            username = signedJWT.getJWTClaimsSet().getSubject();
        } catch (java.text.ParseException e) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }


        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return getLoginResponse(user);
    }

    private LoginResponse getLoginResponse(User user) {
        TokenPayload accessPayload = jwtService.generateAccessToken(user);
        TokenPayload refreshPayload = jwtService.generateRefreshToken(user);

        long refreshTtlSeconds = toTtlSeconds(refreshPayload.getExpiredTime().getTime() - System.currentTimeMillis());
        if (refreshTtlSeconds <= 0) {
            refreshTtlSeconds = 1L;
        }

        redisTokenRepository.save(RedisToken.builder()
                .jwtId(refreshPayload.getJwtId())
                .expiredTime(refreshTtlSeconds)
                .build());

        return LoginResponse.builder()
                .accessToken(accessPayload.getToken())
                .refreshToken(refreshPayload.getToken())
                .build();
    }
}
