package com.ltweb.backend.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltweb.backend.dto.request.CreateBranchRequest;
import com.ltweb.backend.dto.response.ApiResponse;
import com.ltweb.backend.model.Branch;
import com.ltweb.backend.service.BranchService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/branch")
@RequiredArgsConstructor
public class BranchController {
    private final BranchService branchService;

    @PostMapping
    public ApiResponse<Branch> createBranch(@RequestBody @Valid CreateBranchRequest createBranchRequest){
        ApiResponse<Branch> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Create branch successfully!");
        apiResponse.setResult(branchService.createBranch(createBranchRequest));
        return apiResponse;
    }
    
}
