"""
Valuation engines for Pfurex Analytics.
Includes Scorecard, Venture Capital (with feasibility), and Risk‑Adjusted methods.
"""

from typing import Dict, Any, Optional
from decimal import Decimal

# ---------- Scorecard Method (unchanged) ----------
DEFAULT_WEIGHTS = {
    "team": 30,
    "market_size": 25,
    "product_tech": 15,
    "competitive_environment": 10,
    "marketing_sales": 10,
    "funding_need": 5,
    "other": 5,
}

ZIM_BASELINE_VALUATION = 500_000  # fallback default

def scorecard_valuation(
    company_ratings: Dict[str, float],
    weights: Dict[str, float] = None,
    baseline_valuation: float = None
) -> Dict[str, Any]:
    if weights is None:
        weights = DEFAULT_WEIGHTS
    if baseline_valuation is None:
        baseline_valuation = ZIM_BASELINE_VALUATION

    total_weight = sum(weights.values())
    if abs(total_weight - 100) > 0.01:
        raise ValueError(f"Weights must sum to 100, got {total_weight}")

    weighted_sum = 0.0
    factor_details = {}
    for factor, weight in weights.items():
        rating = company_ratings.get(factor, 1.0)
        weighted_sum += weight * rating
        factor_details[factor] = {
            "weight": weight,
            "rating": rating,
            "contribution": weight * rating
        }

    average_rating = weighted_sum / 100.0
    pre_money = baseline_valuation * average_rating

    return {
        "method": "scorecard",
        "pre_money_usd": round(pre_money, 2),
        "baseline_valuation_usd": baseline_valuation,
        "average_rating": round(average_rating, 4),
        "factor_details": factor_details,
        "weights": weights,
    }


# ---------- Venture Capital Method (refined) ----------
def vc_method(
    projected_revenue: float,
    exit_multiple: float,
    target_return: float = 10.0,
    investment_amount: float = 0.0,
    dilution: float = 0.5
) -> Dict[str, Any]:
    """
    Returns pre‑money, post‑money, and a feasibility flag.
    If the requested investment exceeds what the model can support,
    pre‑money is floored at 0 and a warning is added.
    """
    terminal_value = projected_revenue * exit_multiple
    post_money = terminal_value / target_return

    # Pre‑money before dilution (simplified)
    raw_pre = post_money - investment_amount
    pre_money_adj = raw_pre * (1 - dilution)

    # Feasibility check: can the investment achieve the target?
    feasible = pre_money_adj >= 0
    max_investment = post_money * (1 - dilution) if feasible else round(post_money * (1 - dilution), 2)

    result = {
        "method": "venture_capital",
        "terminal_value_usd": round(terminal_value, 2),
        "post_money_usd": round(post_money, 2),
        "pre_money_usd": max(0, round(pre_money_adj, 2)),  # floor at 0
        "feasible": feasible,
        "assumptions": {
            "projected_revenue": projected_revenue,
            "exit_multiple": exit_multiple,
            "target_return": target_return,
            "investment_amount": investment_amount,
            "dilution": dilution,
        }
    }

    if not feasible:
        result["warning"] = (
            f"Requested investment (${investment_amount:,.2f}) exceeds the maximum "
            f"viable investment (${max_investment:,.2f}) under current assumptions."
        )
        result["max_investment_for_target"] = max_investment
    else:
        result["max_investment_for_target"] = round(post_money * (1 - dilution), 2)

    return result


# ---------- Risk‑Adjusted Valuation (configurable curves) ----------
# Default linear map (fallback)
DEFAULT_LINEAR_ADJUSTMENTS = {
    1: 25, 2: 20, 3: 15, 4: 10, 5: 0,
    6: -5, 7: -10, 8: -15, 9: -20, 10: -25
}

def risk_adjusted_valuation(
    baseline_valuation: float,
    category_scores: Dict[str, int],          # e.g. {"policy_regulatory": 8, ...}
    risk_weights: Dict[str, float],           # same weights as risk engine
    adjustment_rules: Optional[Dict[str, Dict[int, int]]] = None,  # per-category, per-score -> pct
) -> Dict[str, Any]:
    """
    If adjustment_rules is None, falls back to DEFAULT_LINEAR_ADJUSTMENTS for all categories.
    adjustment_rules format: { "policy_regulatory": {1: 15, 2: 15, ..., 10: -30}, ... }
    """
    total_weight = sum(risk_weights.values())
    if abs(total_weight - 100) > 0.01:
        raise ValueError(f"Risk weights must sum to 100, got {total_weight}")

    net_adjustment_pct = 0.0
    adjustments = {}
    for factor, weight in risk_weights.items():
        score = category_scores.get(factor, 5)
        if not 1 <= score <= 10:
            raise ValueError(f"Score for '{factor}' must be 1‑10, got {score}")

        # Get the adjustment percentage for this category and score
        if adjustment_rules and factor in adjustment_rules:
            pct = adjustment_rules[factor].get(score, 0)
        else:
            pct = DEFAULT_LINEAR_ADJUSTMENTS.get(score, 0)

        weighted_pct = (weight / 100.0) * pct
        net_adjustment_pct += weighted_pct
        adjustments[factor] = {
            "score": score,
            "adjustment_pct": pct,
            "weighted_adjustment": weighted_pct
        }

    # Cap to prevent extreme swings
    net_adjustment_pct = max(-50, min(50, net_adjustment_pct))
    adjusted_value = baseline_valuation * (1 + net_adjustment_pct / 100.0)

    return {
        "method": "risk_adjusted",
        "baseline_valuation_usd": baseline_valuation,
        "net_adjustment_pct": round(net_adjustment_pct, 2),
        "adjusted_valuation_usd": round(adjusted_value, 2),
        "category_adjustments": adjustments,
        "adjustment_source": "config" if adjustment_rules else "linear_default",
    }
