from typing import Generic, TypeVar, Type, Optional, Sequence
from sqlmodel import Session, select

T = TypeVar("T")


class BaseRepository(Generic[T]):
    def __init__(self, model_class: Type[T], session: Session):
        self.model_class = model_class
        self.session = session

    def get_by_id(self, id: int) -> Optional[T]:
        return self.session.get(self.model_class, id)

    def get_all(self, skip: int = 0, limit: int = 20) -> Sequence[T]:
        statement = select(self.model_class).offset(skip).limit(limit)
        return self.session.exec(statement).all()

    def add(self, entity: T) -> T:
        self.session.add(entity)
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
