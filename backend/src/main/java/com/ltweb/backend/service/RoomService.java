package com.ltweb.backend.service;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.ltweb.backend.dto.request.CreateRoomRequest;
import com.ltweb.backend.dto.request.UpdateRoomRequest;
import com.ltweb.backend.dto.response.RoomResponse;
import com.ltweb.backend.entity.Branch;
import com.ltweb.backend.entity.Room;
import com.ltweb.backend.enums.RoomStatus;
import com.ltweb.backend.enums.RoomType;
import com.ltweb.backend.exception.AppException;
import com.ltweb.backend.exception.ErrorCode;
import com.ltweb.backend.repository.BranchRepository;
import com.ltweb.backend.repository.RoomRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final BranchRepository branchRepository;

    @PreAuthorize("hasRole('ADMIN')")
    public RoomResponse createRoom(CreateRoomRequest request) {
        Branch branch = branchRepository.findById(request.getBranchId())
            .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOT_FOUND));

        Room room = new Room();
        room.setCode(request.getCode());
        room.setName(request.getName());
        room.setRoomType(request.getRoomType() != null ? request.getRoomType() : RoomType.TWO_D);
        room.setSeatCapacity(request.getSeatCapacity());
        room.setStatus(request.getStatus());
        room.setBranch(branch);

        return toRoomResponse(roomRepository.save(room));
    }

    public List<RoomResponse> getAllRooms(String branchId, RoomStatus status) {
        if (branchId != null && status != null) {
            return roomRepository.findByBranchIdAndStatus(branchId, status).stream()
                .map(this::toRoomResponse)
                .toList();
        }
        if (branchId != null) {
            return roomRepository.findByBranchId(branchId).stream()
                .map(this::toRoomResponse)
                .toList();
        }
        if (status != null) {
            return roomRepository.findByStatus(status).stream()
                .map(this::toRoomResponse)
                .toList();
        }
        return roomRepository.findAll().stream()
            .map(this::toRoomResponse)
            .toList();
    }

    public RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        return toRoomResponse(room);
    }
    

    @PreAuthorize("hasRole('ADMIN')")
    public RoomResponse updateRoom(Long id, UpdateRoomRequest request) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (request.getBranchId() != null) {
            Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOT_FOUND));
            room.setBranch(branch);
        }

        if (request.getCode() != null) {
            room.setCode(request.getCode());
        }
        if (request.getName() != null) {
            room.setName(request.getName());
        }
        if (request.getRoomType() != null) {
            room.setRoomType(request.getRoomType());
        }
        if (request.getSeatCapacity() != null) {
            room.setSeatCapacity(request.getSeatCapacity());
        }
        if (request.getStatus() != null) {
            room.setStatus(request.getStatus());
        }

        return toRoomResponse(roomRepository.save(room));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        roomRepository.delete(room);
    }

    private RoomResponse toRoomResponse(Room room) {
        return RoomResponse.builder()
            .id(room.getId())
            .code(room.getCode())
            .name(room.getName())
            .roomType(room.getRoomType())
            .seatCapacity(room.getSeatCapacity())
            .status(room.getStatus())
            .branchId(room.getBranch().getBranch_id())
            .build();
    }
}
