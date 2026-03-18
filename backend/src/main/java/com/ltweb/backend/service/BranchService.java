package com.ltweb.backend.service;

import org.springframework.stereotype.Service;

import com.ltweb.backend.dto.request.CreateBranchRequest;
import com.ltweb.backend.model.Branch;
import com.ltweb.backend.repository.BranchRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BranchService {
    private final BranchRepository branchRepository;

    public Branch createBranch(CreateBranchRequest createBranchRequest){
        Branch branch = new Branch();
        branch.setName(createBranchRequest.getName());
        return branchRepository.save(branch);
    }

    public void deleteBranch(String branch_id){
        branchRepository.deleteById(branch_id);
        
    }
}
