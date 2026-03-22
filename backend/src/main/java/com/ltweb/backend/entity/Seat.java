package com.ltweb.backend.entity;

import java.util.ArrayList;
import java.util.List;

import com.ltweb.backend.enums.SeatType;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "seats",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"room_id", "seat_code"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "seat_id")
    private String seatId;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "seat_code")
    private String seatCode;

    private String rowLabel;

    private Integer seatNumber;

    @Enumerated(EnumType.STRING)
    private SeatType seatType;

    private Boolean isActive;

    @OneToMany(mappedBy = "seat", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Ticket> tickets = new ArrayList<>();
}
