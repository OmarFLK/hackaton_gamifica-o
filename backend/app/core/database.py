"""Engine SQLAlchemy 2.0: Neon (PostgreSQL) via DATABASE_URL ou SQLite local.

MVP usa Base.metadata.create_all. Antes de qualquer piloto real, adotar Alembic.
`engine` e `SessionLocal` são lidos em tempo de chamada para que os testes
possam substituí-los por um SQLite em memória.
"""
from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import database_url


class Base(DeclarativeBase):
    pass


def make_engine(url: str):
    if url.startswith('sqlite'):
        sqlite_engine = create_engine(url, connect_args={'check_same_thread': False})
        @event.listens_for(sqlite_engine, 'connect')
        def enable_foreign_keys(connection, _):
            cursor = connection.cursor()
            cursor.execute('PRAGMA foreign_keys=ON')
            cursor.close()
        return sqlite_engine
    # Neon Free: pool pequeno, conexões verificadas (o compute hiberna).
    return create_engine(url, pool_size=3, max_overflow=2, pool_pre_ping=True, pool_recycle=300)


engine = make_engine(database_url())
SessionLocal = sessionmaker(engine, expire_on_commit=False)


def get_db():
    with SessionLocal() as db:
        yield db


def init_db():
    from app.models import entities  # noqa: F401  registra as tabelas no metadata
    Base.metadata.create_all(engine)
    from app.core.migrations import upgrade_legacy_schema
    upgrade_legacy_schema(engine)
