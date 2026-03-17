from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.attendance import AttendanceSession, SessionStatus
from ..schemas.attendance import AttendanceJoin, AttendanceHeartbeat, AttendanceLeave, AttendanceResponse
from datetime import datetime
from typing import List

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/join", response_model=AttendanceResponse)
def join_classroom(payload: AttendanceJoin, db: Session = Depends(get_db)):
    """Creates a new attendance session when a student joins the classroom."""
    # Check if a session already exists to avoid duplicates
    existing = db.query(AttendanceSession).filter(
        AttendanceSession.classroom_id == payload.room_id,
        AttendanceSession.name == payload.name,
        AttendanceSession.status != SessionStatus.LEFT
    ).first()
    
    if existing:
        return existing

    session = AttendanceSession(
        user_id=payload.user_id,
        name=payload.name,
        classroom_id=payload.room_id,
        status=SessionStatus.ACTIVE
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.post("/heartbeat")
def record_heartbeat(payload: AttendanceHeartbeat, db: Session = Depends(get_db)):
    """Receives periodic heartbeats and increments active time."""
    session = db.query(AttendanceSession).filter(AttendanceSession.id == payload.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if session.status == SessionStatus.LEFT:
        return {"message": "Session already ended"}

    now = datetime.utcnow()
    elapsed = (now - session.last_seen).total_seconds()
    
    # Increment if within heartbeats rate (e.g. sent 30-60s ago)
    # Allows a margin of 90 seconds gap buffers accurately.
    if elapsed < 90:
        session.total_active_time += int(elapsed)
        
    session.last_seen = now
    session.status = SessionStatus.ACTIVE
    db.commit()
    
    return {"message": "Heartbeat received", "total_active_minutes": session.total_active_time // 60}

@router.post("/leave")
def leave_classroom(payload: AttendanceLeave, db: Session = Depends(get_db)):
    """Marks the attendance session as ended."""
    session = db.query(AttendanceSession).filter(AttendanceSession.id == payload.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    now = datetime.utcnow()
    elapsed = (now - session.last_seen).total_seconds()
    
    if elapsed < 90 and session.status != SessionStatus.LEFT:
        session.total_active_time += int(elapsed)
        
    session.status = SessionStatus.LEFT
    session.last_seen = now
    db.commit()
    return {"message": "Left successfully", "total_active_time": session.total_active_time}

@router.get("/{classroom_id}", response_model=List[AttendanceResponse])
def get_attendance(classroom_id: str, db: Session = Depends(get_db)):
    """Teacher dashboard lists for active minutes stats."""
    # Automatically sweep inactivity before serving list triggers! (Optional)
    now = datetime.utcnow()
    inactives = db.query(AttendanceSession).filter(
        AttendanceSession.classroom_id == classroom_id,
        AttendanceSession.status == SessionStatus.ACTIVE
    ).all()
    
    for s in inactives:
        if (now - s.last_seen).total_seconds() > 90:
            s.status = SessionStatus.INACTIVE
    db.commit()

    sessions = db.query(AttendanceSession).filter(AttendanceSession.classroom_id == classroom_id).all()
    return sessions
