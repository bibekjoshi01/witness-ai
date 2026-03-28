import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context
from app.config import Settings
from app.db import Base
import app.models  # noqa: F401 ensure models imported

config = context.config
# Logging config is optional; guard to avoid KeyError when minimal ini is used.
try:
    if config.config_file_name is not None:
        fileConfig(config.config_file_name)
except KeyError:
    pass
settings = Settings()
config.set_main_option("sqlalchemy.url", settings.database_url)
target_metadata = Base.metadata

def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations():
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        future=True,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

async def run_migrations_online():
    await run_async_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
