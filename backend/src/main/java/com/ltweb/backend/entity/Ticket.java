package com.ltweb.backend.entity;

import java.math.BigDecimal;

import com.ltweb.backend.enums.TicketStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
	name = "tickets",
	uniqueConstraints = {
		@UniqueConstraint(columnNames = {"showtime_id", "seat_id"})
	}
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(name = "ticket_id")
	private String id;

	@ManyToOne
	@JoinColumn(name = "booking_id", nullable = false)
	private Booking booking;

	@ManyToOne
	@JoinColumn(name = "showtime_id", nullable = false)
	private Showtime showtime;

	@ManyToOne
	@JoinColumn(name = "seat_id", nullable = false)
	private Seat seat;

	@Column(nullable = false)
	private BigDecimal price;

	@Enumerated(EnumType.STRING)
	private TicketStatus ticketStatus;

	private String qrCode;
}
