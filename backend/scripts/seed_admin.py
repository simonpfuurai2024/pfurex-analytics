import sys
from pathlib import Path

# Add the backend directory to sys.path so 'app' can be found
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import asyncio
from app.database import async_session
from app.models.auth import User, UserRole
from app.auth.utils import hash_password

async def seed():
    async with async_session() as db:
        admin = User(
            email="admin@pfurex.co.zw",
            hashed_password=hash_password("Admin123!"),
            full_name="Pfurex Admin",
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin)
        await db.commit()
        print("Admin seeded.")

asyncio.run(seed())
