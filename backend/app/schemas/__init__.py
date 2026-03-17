from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    role: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

class RoomCreate(BaseModel):
    title: str
    teacher_name: str

class Room(BaseModel):
    room_id: str
    title: Optional[str] = None
    teacher_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class JoinRoomReq(BaseModel):
    room_id: str
    user_id: int

class Participant(BaseModel):
    id: int
    room_id: str
    user_id: int
    joined_at: datetime
    class Config:
        from_attributes = True
