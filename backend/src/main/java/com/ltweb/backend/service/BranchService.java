package com.ltweb.backend.service;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.ltweb.backend.dto.request.CreateBranchRequest;
import com.ltweb.backend.dto.request.UpdateBranchRequest;
import com.ltweb.backend.dto.response.BranchResponse;
import com.ltweb.backend.entity.Branch;
import com.ltweb.backend.exception.AppException;
import com.ltweb.backend.exception.ErrorCode;
import com.ltweb.backend.repository.BranchRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BranchService {
    private final BranchRepository branchRepository;

    @PreAuthorize("hasRole('ADMIN')")
    public BranchResponse createBranch(CreateBranchRequest createBranchRequest){
        Branch branch = new Branch();
        branch.setBranch_code(createBranchRequest.getBranchCode());
        branch.setName(createBranchRequest.getName());
        branch.setAddress(createBranchRequest.getAddress());
        branch.setCity(createBranchRequest.getCity());
        branch.setPhone(createBranchRequest.getPhone());
        branch.setStatus(createBranchRequest.getStatus());
        return toBranchResponse(branchRepository.save(branch));
    }

    
    public List<BranchResponse> getAllBranches() {
        return branchRepository.findAll().stream()
            .map(this::toBranchResponse)
            .toList();
    }


    public BranchResponse getBranchById(String branchId) {
        Branch branch = branchRepository.findById(branchId)
            .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOT_FOUND));
        return toBranchResponse(branch);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public BranchResponse updateBranch(String branchId, UpdateBranchRequest request) {
        Branch branch = branchRepository.findById(branchId)
            .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOT_FOUND));

        if (request.getBranchCode() != null) {
            branch.setBranch_code(request.getBranchCode());
        }
        if (request.getName() != null) {
            branch.setName(request.getName());
        }
        if (request.getAddress() != null) {
            branch.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            branch.setCity(request.getCity());
        }
        if (request.getPhone() != null) {
            branch.setPhone(request.getPhone());
        }
        if (request.getStatus() != null) {
            branch.setStatus(request.getStatus());
        }

        return toBranchResponse(branchRepository.save(branch));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteBranch(String branchId){
        Branch branch = branchRepository.findById(branchId)
            .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOT_FOUND));
        branchRepository.delete(branch);
    }

    private BranchResponse toBranchResponse(Branch branch) {
        return BranchResponse.builder()
            .branchId(branch.getBranch_id())
            .branchCode(branch.getBranch_code())
            .name(branch.getName())
            .address(branch.getAddress())
            .city(branch.getCity())
            .phone(branch.getPhone())
            .status(branch.getStatus())
            .build();
    }
}
