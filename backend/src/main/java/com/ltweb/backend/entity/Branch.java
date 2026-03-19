package com.ltweb.backend.entity;

import java.util.List;

import com.ltweb.backend.enums.BranchStatus;

import java.util.ArrayList;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "branches")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Branch {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String branch_id;

    @Column(unique = true)
    private String branch_code;

    @Column(nullable = false)
    private String name;

    private String address;

    private String city;

    private String phone;

    @Enumerated(EnumType.STRING)
    private BranchStatus status;

    @OneToMany(mappedBy = "branch", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Room> rooms = new ArrayList<>();
}
