"""Financial simulation with Monte Carlo support for Zimbabwean SMEs."""

from typing import Dict, List, Any, Optional, Tuple
import random
import math
from decimal import Decimal

# ── Deterministic projection (unchanged from before) ──
def run_projection(
    current_revenue: float, current_cogs: float, current_salaries: float,
    current_marketing: float, current_gna: float, current_infrastructure: float,
    current_cash: float, funding_amount: float,
    monthly_revenue_growth_pct: float, cogs_pct_of_revenue: float,
    salary_growth_pct: float, marketing_pct_of_revenue: float,
    gna_pct_of_revenue: float, infrastructure_fixed: float,
    new_hires_per_month: List[Dict[str, float]], capex: List[Dict[str, Any]],
    currency_mix_usd_pct: float, forex_premium_pct: float,
    zesa_cost_per_month: float, inflation_rate_pct: float,
    payment_delay_days: int, months: int = 36,
) -> Tuple[List[Dict], Dict[str, float]]:
    """Run a single deterministic projection. Returns (projections, metrics)."""
    inflation_monthly = (1 + inflation_rate_pct / 100) ** (1 / 12) - 1
    projections = []
    cash = current_cash + funding_amount

    # Apply immediate capex (month 0)
    for cap in capex:
        if cap.get("month", 0) == 0:
            cash -= cap["amount"]

    # Depreciation schedule
    depreciation_schedule = []
    for cap in capex:
        if cap["useful_life"] > 0:
            monthly_dep = cap["amount"] / cap["useful_life"]
            for m in range(cap.get("month", 0), months + 1):
                if m > 0:
                    while len(depreciation_schedule) < m:
                        depreciation_schedule.append(0)
                    if len(depreciation_schedule) == m:
                        depreciation_schedule.append(monthly_dep)

    rev = current_revenue
    expenses = {
        "cogs": current_cogs, "salaries": current_salaries,
        "marketing": current_marketing, "gna": current_gna,
        "infrastructure": current_infrastructure, "zesa": 0,
        "forex_premium": 0, "depreciation": 0,
    }

    for month in range(1, months + 1):
        rev *= (1 + monthly_revenue_growth_pct / 100)
        rev_usd = rev * (currency_mix_usd_pct / 100)
        rev_local = rev - rev_usd

        expenses["cogs"] = rev * cogs_pct_of_revenue / 100
        expenses["marketing"] = rev * marketing_pct_of_revenue / 100
        expenses["gna"] = rev * gna_pct_of_revenue / 100
        if month > 1:
            expenses["salaries"] *= (1 + salary_growth_pct / 100)
        for hire in new_hires_per_month:
            if hire["month"] == month:
                expenses["salaries"] += hire["salary"]
        expenses["infrastructure"] = infrastructure_fixed * ((1 + inflation_monthly) ** month)
        expenses["zesa"] = zesa_cost_per_month
        usd_expenses = expenses["cogs"] + expenses["infrastructure"] + expenses["zesa"]
        expenses["forex_premium"] = usd_expenses * (forex_premium_pct / 100)
        dep = depreciation_schedule[month - 1] if month - 1 < len(depreciation_schedule) else 0
        expenses["depreciation"] = dep

        total_expenses = sum(expenses.values())
        net_cash_flow = rev - total_expenses

        # Payment delay logic
        lag_months = max(1, round(payment_delay_days / 30))
        if month > lag_months:
            prev_local = projections[month - lag_months - 1]["revenue_local"]
            effective_cash_flow = rev_usd + prev_local - total_expenses
        else:
            effective_cash_flow = rev_usd + rev_local - total_expenses

        cash += effective_cash_flow

        projections.append({
            "month": month,
            "revenue": round(rev, 2),
            "revenue_usd": round(rev_usd, 2),
            "revenue_local": round(rev_local, 2),
            "expenses": {k: round(v, 2) for k, v in expenses.items()},
            "total_expenses": round(total_expenses, 2),
            "net_cash_flow": round(effective_cash_flow, 2),
            "cash_balance": round(cash, 2),
        })

    # Metrics
    runway = 0
    for p in projections:
        if p["cash_balance"] <= 0:
            break
        runway += 1

    breakeven = None
    for p in projections:
        if p["net_cash_flow"] > 0:
            breakeven = p["month"]
            break

    return projections, {
        "runway_months": runway,
        "break_even_month": breakeven,
        "final_cash_balance": round(cash, 2),
        "terminal_revenue": projections[-1]["revenue"] if projections else 0,
    }

# ── Monte Carlo wrapper ──
def run_monte_carlo(
    # Base assumptions (same as deterministic)
    base_assumptions: Dict[str, Any],
    # Distribution overrides: keys are the field names, values are (low, high) or (mean, std_dev)
    distributions: Dict[str, Any],
    iterations: int = 1000,
    months: int = 36,
) -> Dict[str, Any]:
    """
    Run many deterministic projections, sampling each input from its distribution.
    distributions map: key -> {"type": "uniform"|"normal", "params": [...]}
    Uniform: params = [low, high]
    Normal: params = [mean, std_dev]
    """
    all_cash_balances = [[] for _ in range(months)]
    all_revenues = [[] for _ in range(months)]
    runways = []
    breakevens = []
    final_cash = []
    terminal_revenues = []

    for _ in range(iterations):
        # Build sampled inputs
        sampled = {}
        for key, dist in distributions.items():
            if key not in base_assumptions:
                continue
            if dist["type"] == "uniform":
                low, high = dist["params"]
                sampled[key] = random.uniform(low, high)
            elif dist["type"] == "normal":
                mean, std = dist["params"]
                sampled[key] = max(0, random.gauss(mean, std))  # avoid negative values
        # Merge with base assumptions
        args = {**base_assumptions, **sampled}

        proj, metrics = run_projection(
            current_revenue=args["current_revenue"],
            current_cogs=args.get("current_cogs", 0),
            current_salaries=args.get("current_salaries", 0),
            current_marketing=args.get("current_marketing", 0),
            current_gna=args.get("current_gna", 0),
            current_infrastructure=args.get("current_infrastructure", 0),
            current_cash=args["current_cash"],
            funding_amount=args["funding_amount"],
            monthly_revenue_growth_pct=args["monthly_revenue_growth_pct"],
            cogs_pct_of_revenue=args.get("cogs_pct_of_revenue", 40),
            salary_growth_pct=args.get("salary_growth_pct", 2),
            marketing_pct_of_revenue=args.get("marketing_pct_of_revenue", 10),
            gna_pct_of_revenue=args.get("gna_pct_of_revenue", 15),
            infrastructure_fixed=args.get("infrastructure_fixed", 500),
            new_hires_per_month=args.get("new_hires", []),
            capex=args.get("capex", []),
            currency_mix_usd_pct=args.get("currency_mix_usd_pct", 70),
            forex_premium_pct=args.get("forex_premium_pct", 5),
            zesa_cost_per_month=args.get("zesa_cost_per_month", 200),
            inflation_rate_pct=args.get("inflation_rate_pct", 10),
            payment_delay_days=args.get("payment_delay_days", 30),
            months=months,
        )

        for i, p in enumerate(proj):
            all_cash_balances[i].append(p["cash_balance"])
            all_revenues[i].append(p["revenue"])
        runways.append(metrics["runway_months"])
        breakevens.append(metrics["break_even_month"])
        final_cash.append(metrics["final_cash_balance"])
        terminal_revenues.append(metrics["terminal_revenue"])

    # Compute percentiles
    def percentile(arr, pct):
        if not arr:
            return 0
        return sorted(arr)[int(len(arr) * pct / 100)]

    results = {
        "iterations": iterations,
        "cash_balance_bands": [
            {
                "month": m + 1,
                "p10": percentile(all_cash_balances[m], 10),
                "p50": percentile(all_cash_balances[m], 50),
                "p90": percentile(all_cash_balances[m], 90),
            }
            for m in range(months)
        ],
        "revenue_bands": [
            {
                "month": m + 1,
                "p10": percentile(all_revenues[m], 10),
                "p50": percentile(all_revenues[m], 50),
                "p90": percentile(all_revenues[m], 90),
            }
            for m in range(months)
        ],
        "runway_percentiles": {
            "p10": percentile(runways, 10),
            "p50": percentile(runways, 50),
            "p90": percentile(runways, 90),
        },
        "breakeven_probability": round(
            sum(1 for b in breakevens if b is not None) / iterations * 100, 1
        ),
        "cash_positive_probability": round(
            sum(1 for c in final_cash if c > 0) / iterations * 100, 1
        ),
        "final_cash_percentiles": {
            "p10": percentile(final_cash, 10),
            "p50": percentile(final_cash, 50),
            "p90": percentile(final_cash, 90),
        },
    }
    return results
