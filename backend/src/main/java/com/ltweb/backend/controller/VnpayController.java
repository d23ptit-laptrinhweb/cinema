package com.ltweb.backend.controller;


import com.ltweb.backend.dto.response.ApiResponse;
import com.ltweb.backend.dto.request.CreateVnpayRequest;
import com.ltweb.backend.dto.request.QueryRequest;
import com.ltweb.backend.dto.request.RefundRequest;
import com.ltweb.backend.service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/v1/vnpay")
public class VnpayController {

    private final VnpayService vnpayService;

    public VnpayController(VnpayService vnpayService) {
        this.vnpayService = vnpayService;
    }

    @PostMapping("/payment-url")
    public ApiResponse createPayment(@Valid @RequestBody CreateVnpayRequest request, HttpServletRequest servletRequest) {
        Map<String, Object> data = vnpayService.createPaymentUrl(request, servletRequest);
        return new ApiResponse(200, "success", data);
    }

    @PostMapping("/querydr")
    public ApiResponse querydr(@Valid @RequestBody QueryRequest request, HttpServletRequest servletRequest) {
        String data = vnpayService.queryDr(request, servletRequest);
        return new ApiResponse(200, "success", data);
    }

    @PostMapping("/refund")
    public ApiResponse refund(@Valid @RequestBody RefundRequest request, HttpServletRequest servletRequest) {
        String data = vnpayService.refund(request, servletRequest);
        return new ApiResponse(200, "success", data);
    }

    @GetMapping("/return")
    public ApiResponse paymentReturn(@RequestParam Map<String, String> params) {
        Map<String, Object> verify = vnpayService.verifyCallback(params);

        boolean validSignature = Boolean.TRUE.equals(verify.get("validSignature"));
        boolean successStatus = "00".equals(params.get("vnp_TransactionStatus"));

        if (validSignature && successStatus) {
            return new ApiResponse(200, "Thanh cong", verify);
        }
        return new ApiResponse(99, "Khong thanh cong hoac sai checksum", verify);
    }

    @GetMapping("/ipn")
    public Map<String, String> ipn(@RequestParam Map<String, String> params) {
        Map<String, Object> verify = vnpayService.verifyCallback(params);
        boolean validSignature = Boolean.TRUE.equals(verify.get("validSignature"));

        if (!validSignature) {
            return rsp("97", "Invalid Checksum");
        }

        boolean checkOrderId = true;
        boolean checkAmount = true;
        boolean checkOrderStatus = true;

        if (!checkOrderId) return rsp("01", "Order not Found");
        if (!checkAmount) return rsp("04", "Invalid Amount");
        if (!checkOrderStatus) return rsp("02", "Order already confirmed");

        return rsp("00", "Confirm Success");
    }

    private Map<String, String> rsp(String code, String message) {
        Map<String, String> m = new HashMap<>();
        m.put("RspCode", code);
        m.put("Message", message);
        return m;
    }
}