import asyncio
import json
from aiokafka import AIOKafkaProducer

async def main():
    producer = AIOKafkaProducer(bootstrap_servers="localhost:9092")
    await producer.start()
    try:
        event = {
            "document_id": "41e4f867-c071-454e-b1a7-dc85c650ff82",
            "company_id": "a0532084-e49f-4eef-9364-5f34a05362a8",
            "file_path": "uploads/a0532084-e49f-4eef-9364-5f34a05362a8/41e4f867-c071-454e-b1a7-dc85c650ff82.xlsx"
        }
        await producer.send_and_wait("document.uploaded", json.dumps(event).encode())
        print("Event sent.")
    finally:
        await producer.stop()

asyncio.run(main())
