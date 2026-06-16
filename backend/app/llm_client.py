"""LLM client for Pfurex Analytics – local Mistral with thread‑pool execution."""
import os
import asyncio
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from llama_cpp import Llama

MODEL_PATH = Path(os.getenv("LLM_MODEL_PATH", "/home/dev/pfurex-analytics/models/mistral-7b-instruct-v0.2.Q4_K_M.gguf"))

# Single model instance shared across all threads (llama-cpp-python is thread‑safe)
_model = None
# Thread pool – 2 workers means 2 LLM calls can run simultaneously without blocking the API
_executor = ThreadPoolExecutor(max_workers=2)

def get_model():
    global _model
    if _model is None:
        _model = Llama(model_path=str(MODEL_PATH), n_ctx=2048, n_threads=4, verbose=False)
    return _model

def _run_llm(prompt: str, system_message: str, temperature: float, max_tokens: int) -> str:
    """Synchronous LLM call (runs in a thread)."""
    model = get_model()
    full_prompt = f"<s>[INST] {system_message}\n\n{prompt} [/INST]"
    response = model(full_prompt, max_tokens=max_tokens, temperature=temperature, stop=["```"])
    return response["choices"][0]["text"].strip()

async def llm_complete(
    prompt: str,
    system_message: str = "You are a financial analyst for Zimbabwean startups.",
    temperature: float = 0.0,
    max_tokens: int = 1024,
) -> str:
    """Async wrapper – runs the LLM in a thread pool so the API stays responsive."""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(
        _executor,
        _run_llm,
        prompt,
        system_message,
        temperature,
        max_tokens,
    )
