import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import asyncio
from app.database import async_session
from app.models.reference import SectorBaseline, ExitMultiple, RiskAdjustmentRule
from sqlalchemy import delete

async def seed():
    async with async_session() as db:
        # Clear existing reference data (idempotent)
        await db.execute(delete(RiskAdjustmentRule))
        await db.execute(delete(ExitMultiple))
        await db.execute(delete(SectorBaseline))
        await db.flush()

        # ---------- Sector Baselines ----------
        baselines = [
            SectorBaseline(sector="FinTech", stage="Seed", baseline_usd=600_000, source="Regional VC reports"),
            SectorBaseline(sector="AgriTech", stage="Seed", baseline_usd=350_000, source="Regional VC reports"),
            SectorBaseline(sector="HealthTech", stage="Seed", baseline_usd=500_000, source="Regional VC reports"),
            SectorBaseline(sector="CleanTech", stage="Seed", baseline_usd=450_000, source="Regional VC reports"),
            SectorBaseline(sector="Logistics", stage="Seed", baseline_usd=400_000, source="Regional VC reports"),
            SectorBaseline(sector="EdTech", stage="Seed", baseline_usd=300_000, source="Regional VC reports"),
            SectorBaseline(sector="Other", stage="Seed", baseline_usd=500_000, source="Default"),
        ]
        db.add_all(baselines)

        # ---------- Exit Multiples ----------
        multiples = [
            ExitMultiple(sector="FinTech", stage="Seed", multiple=5.0, source="SA acquisitions"),
            ExitMultiple(sector="AgriTech", stage="Seed", multiple=2.0, source="SA acquisitions"),
            ExitMultiple(sector="HealthTech", stage="Seed", multiple=3.5, source="SA acquisitions"),
            ExitMultiple(sector="CleanTech", stage="Seed", multiple=3.0, source="SA acquisitions"),
            ExitMultiple(sector="Logistics", stage="Seed", multiple=2.5, source="SA acquisitions"),
            ExitMultiple(sector="EdTech", stage="Seed", multiple=2.0, source="SA acquisitions"),
            ExitMultiple(sector="Other", stage="Seed", multiple=3.0, source="Default"),
        ]
        db.add_all(multiples)

        # ---------- Risk Adjustment Rules (asymmetric curves) ----------
        rules = [
            # policy_regulatory
            RiskAdjustmentRule(category="policy_regulatory", score=1, adjustment_pct=15, description="Very stable"),
            RiskAdjustmentRule(category="policy_regulatory", score=2, adjustment_pct=15, description="Stable"),
            RiskAdjustmentRule(category="policy_regulatory", score=3, adjustment_pct=10, description="Mostly stable"),
            RiskAdjustmentRule(category="policy_regulatory", score=4, adjustment_pct=5, description="Slightly stable"),
            RiskAdjustmentRule(category="policy_regulatory", score=5, adjustment_pct=0, description="Moderate"),
            RiskAdjustmentRule(category="policy_regulatory", score=6, adjustment_pct=-5, description="Some uncertainty"),
            RiskAdjustmentRule(category="policy_regulatory", score=7, adjustment_pct=-10, description="Uncertain"),
            RiskAdjustmentRule(category="policy_regulatory", score=8, adjustment_pct=-15, description="High uncertainty"),
            RiskAdjustmentRule(category="policy_regulatory", score=9, adjustment_pct=-20, description="Very high risk"),
            RiskAdjustmentRule(category="policy_regulatory", score=10, adjustment_pct=-30, description="Extreme risk"),

            # currency_macro
            RiskAdjustmentRule(category="currency_macro", score=1, adjustment_pct=10, description="Very stable currency"),
            RiskAdjustmentRule(category="currency_macro", score=2, adjustment_pct=10, description="Stable"),
            RiskAdjustmentRule(category="currency_macro", score=3, adjustment_pct=5, description="Mostly stable"),
            RiskAdjustmentRule(category="currency_macro", score=4, adjustment_pct=0, description="Slightly stable"),
            RiskAdjustmentRule(category="currency_macro", score=5, adjustment_pct=-5, description="Moderate"),
            RiskAdjustmentRule(category="currency_macro", score=6, adjustment_pct=-10, description="Some pressure"),
            RiskAdjustmentRule(category="currency_macro", score=7, adjustment_pct=-15, description="Under pressure"),
            RiskAdjustmentRule(category="currency_macro", score=8, adjustment_pct=-20, description="High volatility"),
            RiskAdjustmentRule(category="currency_macro", score=9, adjustment_pct=-25, description="Very high volatility"),
            RiskAdjustmentRule(category="currency_macro", score=10, adjustment_pct=-30, description="Hyperinflation/devaluation"),

            # management_governance
            RiskAdjustmentRule(category="management_governance", score=1, adjustment_pct=25, description="Exceptional team"),
            RiskAdjustmentRule(category="management_governance", score=2, adjustment_pct=25, description="Strong team"),
            RiskAdjustmentRule(category="management_governance", score=3, adjustment_pct=20, description="Very capable"),
            RiskAdjustmentRule(category="management_governance", score=4, adjustment_pct=10, description="Capable"),
            RiskAdjustmentRule(category="management_governance", score=5, adjustment_pct=5, description="Adequate"),
            RiskAdjustmentRule(category="management_governance", score=6, adjustment_pct=0, description="Minor gaps"),
            RiskAdjustmentRule(category="management_governance", score=7, adjustment_pct=-5, description="Some gaps"),
            RiskAdjustmentRule(category="management_governance", score=8, adjustment_pct=-10, description="Significant gaps"),
            RiskAdjustmentRule(category="management_governance", score=9, adjustment_pct=-15, description="Weak team"),
            RiskAdjustmentRule(category="management_governance", score=10, adjustment_pct=-20, description="Inadequate team"),

            # operational_infrastructure
            RiskAdjustmentRule(category="operational_infrastructure", score=1, adjustment_pct=10, description="World-class ops"),
            RiskAdjustmentRule(category="operational_infrastructure", score=2, adjustment_pct=10, description="Excellent ops"),
            RiskAdjustmentRule(category="operational_infrastructure", score=3, adjustment_pct=5, description="Very good ops"),
            RiskAdjustmentRule(category="operational_infrastructure", score=4, adjustment_pct=5, description="Good ops"),
            RiskAdjustmentRule(category="operational_infrastructure", score=5, adjustment_pct=0, description="Adequate ops"),
            RiskAdjustmentRule(category="operational_infrastructure", score=6, adjustment_pct=-5, description="Some weaknesses"),
            RiskAdjustmentRule(category="operational_infrastructure", score=7, adjustment_pct=-10, description="Weaknesses"),
            RiskAdjustmentRule(category="operational_infrastructure", score=8, adjustment_pct=-15, description="Significant issues"),
            RiskAdjustmentRule(category="operational_infrastructure", score=9, adjustment_pct=-20, description="Major issues"),
            RiskAdjustmentRule(category="operational_infrastructure", score=10, adjustment_pct=-25, description="Unworkable ops"),

            # market_competition
            RiskAdjustmentRule(category="market_competition", score=1, adjustment_pct=15, description="No competition"),
            RiskAdjustmentRule(category="market_competition", score=2, adjustment_pct=15, description="Minimal competition"),
            RiskAdjustmentRule(category="market_competition", score=3, adjustment_pct=10, description="Weak competition"),
            RiskAdjustmentRule(category="market_competition", score=4, adjustment_pct=5, description="Manageable"),
            RiskAdjustmentRule(category="market_competition", score=5, adjustment_pct=0, description="Moderate"),
            RiskAdjustmentRule(category="market_competition", score=6, adjustment_pct=-5, description="Competitive"),
            RiskAdjustmentRule(category="market_competition", score=7, adjustment_pct=-10, description="Highly competitive"),
            RiskAdjustmentRule(category="market_competition", score=8, adjustment_pct=-15, description="Intense competition"),
            RiskAdjustmentRule(category="market_competition", score=9, adjustment_pct=-20, description="Dominant players"),
            RiskAdjustmentRule(category="market_competition", score=10, adjustment_pct=-25, description="Monopoly against us"),
        ]
        db.add_all(rules)

        await db.commit()
        print("Reference data re‑seeded successfully.")

asyncio.run(seed())
