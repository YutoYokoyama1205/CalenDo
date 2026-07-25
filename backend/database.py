import os

from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    MetaData,
    String,
    Table,
    create_engine,
    delete,
    insert,
    select,
    update,
)


DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://", "postgresql+psycopg://", 1
    )

database_enabled = bool(DATABASE_URL)
metadata = MetaData()

users = Table(
    "users",
    metadata,
    Column("id", String(32), primary_key=True),
    Column("username", String(30), nullable=False, unique=True),
    Column("password_hash", String(255), nullable=False),
)

tasks = Table(
    "tasks",
    metadata,
    Column("user_id", String(32), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("date", String(10), primary_key=True),
    Column("task_id", Integer, primary_key=True),
    Column("task_name", String(80), nullable=False),
    Column("start_time", String(5), nullable=False),
    Column("end_time", String(5), nullable=False),
    Column("completed", Boolean, nullable=False, default=False),
)

engine = (
    create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
    )
    if database_enabled
    else None
)
_schema_ready = False


def ensure_schema():
    global _schema_ready
    if database_enabled and not _schema_ready:
        metadata.create_all(engine)
        _schema_ready = True


def list_users():
    ensure_schema()
    with engine.connect() as connection:
        return [dict(row._mapping) for row in connection.execute(select(users))]


def create_user(user):
    ensure_schema()
    with engine.begin() as connection:
        connection.execute(insert(users).values(**user))


def update_password(user_id, password_hash):
    ensure_schema()
    with engine.begin() as connection:
        connection.execute(
            update(users)
            .where(users.c.id == user_id)
            .values(password_hash=password_hash)
        )


def delete_user(user_id):
    ensure_schema()
    with engine.begin() as connection:
        connection.execute(delete(tasks).where(tasks.c.user_id == user_id))
        connection.execute(delete(users).where(users.c.id == user_id))


def load_user_tasks(user_id):
    ensure_schema()
    query = (
        select(tasks)
        .where(tasks.c.user_id == user_id)
        .order_by(tasks.c.date, tasks.c.start_time)
    )
    with engine.connect() as connection:
        return [dict(row._mapping) for row in connection.execute(query)]


def replace_user_tasks(user_id, rows):
    ensure_schema()
    with engine.begin() as connection:
        connection.execute(delete(tasks).where(tasks.c.user_id == user_id))
        if rows:
            connection.execute(insert(tasks), rows)
