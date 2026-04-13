package com.ltweb.backend.mapper;

import com.ltweb.backend.dto.request.CreateRoomRequest;
import com.ltweb.backend.dto.response.RoomResponse;
import com.ltweb.backend.entity.Room;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoomMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "branch", ignore = true)
    Room toRoomEntity(CreateRoomRequest request);

    @Mapping(target = "branchId", source = "branch.branchId")
    RoomResponse toRoomResponse(Room room);
}
