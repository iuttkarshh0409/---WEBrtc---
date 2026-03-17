from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Room, Participant, User
from ..schemas import RoomCreate, Room as RoomSchema, JoinRoomReq, Participant as ParticipantSchema

from typing import List

router = APIRouter()

@router.get("/rooms", response_model=List[RoomSchema])
def list_active_rooms(db: Session = Depends(get_db)):
    # Fetch all active classrooms
    return db.query(Room).filter(Room.is_active == True).all()

@router.post("/create-room", response_model=RoomSchema)
def create_room(room: RoomCreate, db: Session = Depends(get_db)):
    db_room = Room(title=room.title, teacher_name=room.teacher_name, is_active=True)
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

@router.post("/join-room")
def join_room(req: JoinRoomReq, db: Session = Depends(get_db)):
    db_room = db.query(Room).filter(Room.room_id == req.room_id).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Make sure user exists (mocking students for demo)
    db_user = db.query(User).filter(User.id == req.user_id).first()
    if not db_user:
        db_user = User(id=req.user_id, name=f"Student {req.user_id}", role="student")
        db.add(db_user)
        db.commit()

    db_participant = Participant(room_id=req.room_id, user_id=req.user_id)
    db.add(db_participant)
    db.commit()
    
    return {"message": "Joined successfully", "room_id": req.room_id, "user_id": req.user_id}

@router.get("/room/{room_id}", response_model=RoomSchema)
def get_room(room_id: str, db: Session = Depends(get_db)):
    db_room = db.query(Room).filter(Room.room_id == room_id).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    return db_room
