package com.ltweb.backend.service;


import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.ltweb.backend.config.VnpayProperties;
import com.ltweb.backend.dto.request.CreateVnpayRequest;
import com.ltweb.backend.dto.request.QueryRequest;
import com.ltweb.backend.dto.request.RefundRequest;
import com.ltweb.backend.util.VnpayUtil;

import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VnpayService {

    private final VnpayProperties props;
    private final RestTemplate restTemplate;

    public VnpayService(VnpayProperties props, RestTemplate restTemplate) {
        this.props = props;
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> createPaymentUrl(CreateVnpayRequest req, HttpServletRequest request) {
        String vnpVersion = "2.1.0";
        String vnpCommand = "pay";
        String orderType = (req.getOrderType() == null || req.getOrderType().isBlank()) ? "other" : req.getOrderType();
        String txnRef = (req.getOrderId() == null || req.getOrderId().isBlank()) ? VnpayUtil.randomNumeric(8) : req.getOrderId();
        String ipAddr = VnpayUtil.getClientIp(request);

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", vnpVersion);
        params.put("vnp_Command", vnpCommand);
        params.put("vnp_TmnCode", props.getTmnCode());
        params.put("vnp_Amount", String.valueOf(req.getAmount() * 100));
        params.put("vnp_CurrCode", "VND");

        if (req.getBankCode() != null && !req.getBankCode().isBlank()) {
            params.put("vnp_BankCode", req.getBankCode());
        }

        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", (req.getOrderInfo() == null || req.getOrderInfo().isBlank())
                ? "Thanh toan don hang:" + txnRef
                : req.getOrderInfo());
        params.put("vnp_OrderType", orderType);
        params.put("vnp_Locale", (req.getLanguage() == null || req.getLanguage().isBlank()) ? "vn" : req.getLanguage());
        params.put("vnp_ReturnUrl", props.getReturnUrl());
        params.put("vnp_IpAddr", ipAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        params.put("vnp_CreateDate", formatter.format(cld.getTime()));
        cld.add(Calendar.MINUTE, 15);
        params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append("=").append(VnpayUtil.encode(fieldValue));
                query.append(VnpayUtil.encode(fieldName)).append("=").append(VnpayUtil.encode(fieldValue));
                if (itr.hasNext()) {
                    hashData.append("&");
                    query.append("&");
                }
            }
        }

        String secureHash = VnpayUtil.hmacSHA512(props.getSecretKey(), hashData.toString());
        String paymentUrl = props.getPayUrl() + "?" + query + "&vnp_SecureHash=" + secureHash;

        Map<String, Object> result = new HashMap<>();
        result.put("paymentUrl", paymentUrl);
        result.put("txnRef", txnRef);
        return result;
    }

    public String queryDr(QueryRequest req, HttpServletRequest servletRequest) {
        String requestId = VnpayUtil.randomNumeric(8);
        String version = "2.1.0";
        String command = "querydr";
        String tmnCode = props.getTmnCode();
        String orderInfo = "Kiem tra ket qua GD OrderId:" + req.getOrderId();
        String ipAddr = VnpayUtil.getClientIp(servletRequest);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String createDate = formatter.format(cld.getTime());

        String hashData = String.join("|",
                requestId, version, command, tmnCode, req.getOrderId(),
                req.getTransDate(), createDate, ipAddr, orderInfo);

        String secureHash = VnpayUtil.hmacSHA512(props.getSecretKey(), hashData);

        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("vnp_RequestId", requestId);
        payload.put("vnp_Version", version);
        payload.put("vnp_Command", command);
        payload.put("vnp_TmnCode", tmnCode);
        payload.put("vnp_TxnRef", req.getOrderId());
        payload.put("vnp_OrderInfo", orderInfo);
        payload.put("vnp_TransactionDate", req.getTransDate());
        payload.put("vnp_CreateDate", createDate);
        payload.put("vnp_IpAddr", ipAddr);
        payload.put("vnp_SecureHash", secureHash);

        return postJson(payload);
    }

    public String refund(RefundRequest req, HttpServletRequest servletRequest) {
        String requestId = VnpayUtil.randomNumeric(8);
        String version = "2.1.0";
        String command = "refund";
        String tmnCode = props.getTmnCode();
        String transactionNo = "";
        String amount = String.valueOf(req.getAmount() * 100);
        String orderInfo = "Hoan tien GD OrderId:" + req.getOrderId();
        String ipAddr = VnpayUtil.getClientIp(servletRequest);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String createDate = formatter.format(cld.getTime());

        String hashData = String.join("|",
                requestId, version, command, tmnCode, req.getTrantype(),
                req.getOrderId(), amount, transactionNo, req.getTransDate(),
                req.getUser(), createDate, ipAddr, orderInfo);

        String secureHash = VnpayUtil.hmacSHA512(props.getSecretKey(), hashData);

        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("vnp_RequestId", requestId);
        payload.put("vnp_Version", version);
        payload.put("vnp_Command", command);
        payload.put("vnp_TmnCode", tmnCode);
        payload.put("vnp_TransactionType", req.getTrantype());
        payload.put("vnp_TxnRef", req.getOrderId());
        payload.put("vnp_Amount", amount);
        payload.put("vnp_OrderInfo", orderInfo);
        payload.put("vnp_TransactionDate", req.getTransDate());
        payload.put("vnp_CreateBy", req.getUser());
        payload.put("vnp_CreateDate", createDate);
        payload.put("vnp_IpAddr", ipAddr);
        payload.put("vnp_SecureHash", secureHash);

        return postJson(payload);
    }

    public Map<String, Object> verifyCallback(Map<String, String> params) {
        String secureHash = params.get("vnp_SecureHash");

        Map<String, String> filtered = new HashMap<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = entry.getKey();
            if (!"vnp_SecureHash".equals(key) && !"vnp_SecureHashType".equals(key)) {
                filtered.put(key, entry.getValue());
            }
        }

        String hashData = VnpayUtil.buildReturnHashData(filtered);
        String calculatedHash = VnpayUtil.hmacSHA512(props.getSecretKey(), hashData);
        boolean valid = calculatedHash.equals(secureHash);

        Map<String, Object> result = new HashMap<>();
        result.put("validSignature", valid);
        result.put("vnp_TxnRef", params.get("vnp_TxnRef"));
        result.put("vnp_Amount", params.get("vnp_Amount"));
        result.put("vnp_OrderInfo", params.get("vnp_OrderInfo"));
        result.put("vnp_ResponseCode", params.get("vnp_ResponseCode"));
        result.put("vnp_TransactionStatus", params.get("vnp_TransactionStatus"));
        result.put("vnp_TransactionNo", params.get("vnp_TransactionNo"));
        result.put("vnp_BankCode", params.get("vnp_BankCode"));
        result.put("vnp_PayDate", params.get("vnp_PayDate"));
        return result;
    }

    private String postJson(Map<String, String> payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(payload, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(props.getApiUrl(), entity, String.class);
        return response.getBody();
    }
}