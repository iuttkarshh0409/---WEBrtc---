from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AttendanceJoin(BaseModel):
    user_id: Optional[str] = None
    name: str # student name
    room_id: str

class AttendanceHeartbeat(BaseModel):
    session_id: int

class AttendanceLeave(BaseModel):
    session_id: int

class AttendanceResponse(BaseModel):
    id: int
    name: Optional[str] = None
    classroom_id: str
    join_time: datetime
    last_seen: datetime
    total_active_time: int
    status: str

    class Config:
        from_attributes = True
        orm_mode = True # compatibility with older versions
