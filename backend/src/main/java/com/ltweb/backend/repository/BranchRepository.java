package com.ltweb.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ltweb.backend.model.Branch;

@Repository
public interface BranchRepository extends JpaRepository<Branch, String>{
    
}
