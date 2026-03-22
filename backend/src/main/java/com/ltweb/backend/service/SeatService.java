package com.ltweb.backend.service.impl;

import java.util.List;

import com.ltweb.backend.mapper.SeatMapper;
import org.springframework.stereotype.Service;

import com.ltweb.backend.dto.request.CreateSeatRequest;
import com.ltweb.backend.dto.request.UpdateSeatRequest;
import com.ltweb.backend.dto.response.SeatResponse;
import com.ltweb.backend.entity.Room;
import com.ltweb.backend.entity.Seat;
import com.ltweb.backend.repository.RoomRepository;
import com.ltweb.backend.repository.SeatRepository;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;
    private final RoomRepository roomRepository;
    private final SeatMapper seatMapper;

    public SeatResponse createSeat(CreateSeatRequest request) {

        roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (seatRepository.existsByRoomIdAndSeatCode(request.getRoomId(), request.getSeatCode())) {
            throw new RuntimeException("Seat already exists in this room");
        }

        Seat seat = seatMapper.toSeat(request);

        seatRepository.save(seat);

        return seatMapper.toSeatResponse(seat);
    }

    public SeatResponse updateSeat(String seatId, UpdateSeatRequest request) {

        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        seatMapper.updateSeat(seat,request);

        return seatMapper.toSeatResponse(seat);
    }

    public void deleteSeat(String seatId) {
        seatRepository.deleteById(seatId);
    }

    public List<SeatResponse> getSeatsByRoom(String roomId) {
        return seatRepository.findByRoomId(roomId)
                .stream()
                .map(seatMapper::toSeatResponse)
                .toList();
    }

    public SeatResponse getSeatById(String seatId) {

        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        return seatMapper.toSeatResponse(seat);
    }
}