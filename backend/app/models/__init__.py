from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime
import uuid
from ..database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(String)  # 'teacher' or 'student'
    
    participants = relationship("Participant", back_populates="user")

class Room(Base):
    __tablename__ = "rooms"
    room_id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    teacher_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    participants = relationship("Participant", back_populates="room")
    teacher = relationship("User", back_populates="rooms_created")

User.rooms_created = relationship("Room", back_populates="teacher")

class Participant(Base):
    __tablename__ = "participants"
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String, ForeignKey("rooms.room_id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="participants")
    room = relationship("Room", back_populates="participants")
