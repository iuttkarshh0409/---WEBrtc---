from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum

class SessionStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    LEFT = "left"

class AttendanceSession(Base):
    __tablename__ = "attendance_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=True) # or Integer if bound to User
    name = Column(String, nullable=True) # Student name inputted
    classroom_id = Column(Integer, ForeignKey("rooms.id"), index=True)
    
    join_time = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    total_active_time = Column(Integer, default=0) # in seconds
    status = Column(Enum(SessionStatus), default=SessionStatus.ACTIVE)

    # Relationships
    classroom = relationship("Room", backref="attendance_sessions")
