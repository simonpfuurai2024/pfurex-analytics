import json
from aiokafka import AIOKafkaProducer

REDPANDA_BROKER = "localhost:9092"

async def publish_document_uploaded(document_id: str, company_id: str, file_path: str):
    producer = AIOKafkaProducer(bootstrap_servers=REDPANDA_BROKER)
    await producer.start()
    try:
        event = {
            "document_id": document_id,
            "company_id": company_id,
            "file_path": file_path,
        }
        await producer.send_and_wait("document.uploaded", json.dumps(event).encode())
    finally:
        await producer.stop()
