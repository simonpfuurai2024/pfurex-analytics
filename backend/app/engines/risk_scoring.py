"""
Zimbabwe‑specific risk scoring for SMEs.
"""

from typing import Dict, Any

ZIM_RISK_WEIGHTS = {
    "policy_regulatory": 30,
    "currency_macro": 25,
    "management_governance": 20,
    "operational_infrastructure": 15,
    "market_competition": 10,
}

def calculate_risk_score(
    category_scores: Dict[str, int],
    weights: Dict[str, float] = None
) -> Dict[str, Any]:
    if weights is None:
        weights = ZIM_RISK_WEIGHTS

    total_weight = sum(weights.values())
    if abs(total_weight - 100) > 0.01:
        raise ValueError(f"Weights must sum to 100, got {total_weight}")

    weighted_sum = 0.0
    breakdown = {}
    for factor, weight in weights.items():
        score = category_scores.get(factor, 5)
        if not 1 <= score <= 10:
            raise ValueError(f"Score for '{factor}' must be 1‑10")
        weighted_sum += weight * score
        breakdown[factor] = {
            "raw_score": score,
            "weight": weight,
            "weighted_score": weight * score
        }

    overall = round(weighted_sum / 100.0, 2)
    return {
        "overall_score": round(overall * 10),
        "overall_score_raw": overall,
        "category_breakdown": breakdown,
        "weights": weights,
    }
