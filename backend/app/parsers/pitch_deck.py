import json
from pathlib import Path
from llama_cpp import Llama

MODEL_PATH = Path("/home/dev/pfurex-analytics/models/mistral-7b-instruct-v0.2.Q4_K_M.gguf")

def extract_from_text(raw_text: str) -> dict:
    """Use Mistral to extract structured financial data from pitch deck text."""
    llm = Llama(
        model_path=str(MODEL_PATH),
        n_ctx=2048,
        n_threads=4,
        verbose=False
    )
    prompt = f"""Extract the following information from this Zimbabwean startup pitch deck.
Return ONLY a valid JSON object with these fields. Use null for missing fields.

{{
    "company_name": "...",
    "sector": "...",
    "founded_year": 2024,
    "stage": "Seed",
    "revenue_usd": 150000.00,
    "revenue_zwl": null,
    "expenses_usd": 80000.00,
    "cash_balance_usd": 45000.00,
    "monthly_burn_usd": 12000.00,
    "team_size": 8,
    "has_mobile_money": true,
    "primary_contact": {{"name": "...", "email": "..."}},
    "notes": "..."
}}

Pitch deck text:
{raw_text[:3000]}

JSON:"""

    response = llm(prompt, max_tokens=512, temperature=0.0, stop=["```"])
    json_str = response["choices"][0]["text"].strip()
    # Clean up markdown fences if any
    if json_str.startswith("```"):
        json_str = json_str.split("```")[1]
        if json_str.startswith("json"):
            json_str = json_str[4:]
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return {"raw_output": json_str, "parse_error": True}
