CREATE EXTENSION IF NOT EXISTS uuid-ossp;

-- User roles enum
DO 28531 BEGIN
    CREATE TYPE user_role AS ENUM ('business_owner', 'investor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END 28531;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    rate DECIMAL(18, 6) NOT NULL,
    source VARCHAR(50),
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_exchange_rates_pair_date ON exchange_rates(from_currency, to_currency, valid_from);

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    registration_number VARCHAR(100),
    sector VARCHAR(100),
    founded_year INTEGER,
    country VARCHAR(100) DEFAULT 'Zimbabwe',
    description TEXT,
    stage VARCHAR(50),
    primary_contact JSONB,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    parsed_data JSONB,
    parse_status VARCHAR(20) DEFAULT 'pending',
    confidence_scores JSONB
);
CREATE INDEX idx_documents_company ON documents(company_id);

CREATE TABLE financial_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    period_start DATE,
    period_end DATE,
    metric_name VARCHAR(100) NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    usd_equivalent DECIMAL(18,2),
    exchange_rate_id UUID REFERENCES exchange_rates(id),
    is_estimate BOOLEAN DEFAULT FALSE,
    extracted_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_financials_company_period ON financial_records(company_id, period_end);

CREATE TABLE valuations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL,
    calculated_value_usd DECIMAL(18,2) NOT NULL,
    pre_money_usd DECIMAL(18,2),
    post_money_usd DECIMAL(18,2),
    assumptions JSONB NOT NULL,
    output_details JSONB,
    performed_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    overall_score INTEGER CHECK (overall_score BETWEEN 1 AND 100),
    category_scores JSONB NOT NULL,
    assessment_notes TEXT,
    assessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    payload JSONB,
    user_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
