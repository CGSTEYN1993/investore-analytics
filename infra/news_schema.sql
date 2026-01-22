-- News Articles and Buzz Metrics Schema
-- Stores scraped mining news and calculates buzz metrics for companies

-- =============================================================================
-- NEWS ARTICLES TABLE
-- Stores individual news articles from various mining news sources
-- =============================================================================
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    
    -- Article identification
    url TEXT UNIQUE NOT NULL,
    url_hash VARCHAR(64) NOT NULL, -- SHA256 hash for quick duplicate checking
    
    -- Article content
    title TEXT NOT NULL,
    snippet TEXT,
    full_content TEXT,
    
    -- Source information
    source_id VARCHAR(50) NOT NULL, -- mining_news_net, northern_miner, etc.
    source_name VARCHAR(100) NOT NULL,
    source_region VARCHAR(50), -- Australia, Canada, Africa, Global
    
    -- Timestamps
    published_date TIMESTAMP WITH TIME ZONE,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Analysis
    sentiment_score DECIMAL(4,3), -- -1.000 to 1.000
    
    -- Metadata
    raw_html TEXT,
    extraction_metadata JSONB DEFAULT '{}',
    
    -- Indexes for fast lookups
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast URL lookups
CREATE INDEX IF NOT EXISTS idx_news_articles_url_hash ON news_articles(url_hash);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON news_articles(published_date DESC);

-- Index for source filtering
CREATE INDEX IF NOT EXISTS idx_news_articles_source ON news_articles(source_id, published_date DESC);

-- =============================================================================
-- COMPANY MENTIONS TABLE
-- Links articles to companies mentioned in them
-- =============================================================================
CREATE TABLE IF NOT EXISTS article_company_mentions (
    id SERIAL PRIMARY KEY,
    
    article_id INTEGER NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
    
    -- Company identification
    ticker VARCHAR(10) NOT NULL, -- e.g., "BHP", "SFR"
    exchange VARCHAR(10), -- ASX, TSX, JSE, LSE, NYSE
    company_name VARCHAR(200),
    
    -- Mention details
    mention_type VARCHAR(20) DEFAULT 'mentioned', -- 'primary', 'mentioned', 'passing'
    mention_count INTEGER DEFAULT 1, -- How many times mentioned in article
    
    -- Context
    mention_context TEXT, -- Sentence or paragraph where mentioned
    headline_mention BOOLEAN DEFAULT FALSE, -- Is company in the headline?
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for finding articles about a company
CREATE INDEX IF NOT EXISTS idx_article_mentions_ticker 
    ON article_company_mentions(ticker, exchange);

-- Index for joining back to articles
CREATE INDEX IF NOT EXISTS idx_article_mentions_article 
    ON article_company_mentions(article_id);

-- =============================================================================
-- NEWS BUZZ METRICS TABLE
-- Pre-calculated buzz metrics for companies (updated periodically)
-- =============================================================================
CREATE TABLE IF NOT EXISTS news_buzz_metrics (
    id SERIAL PRIMARY KEY,
    
    -- Company identification
    ticker VARCHAR(10) NOT NULL,
    exchange VARCHAR(10) DEFAULT 'ASX',
    company_name VARCHAR(200),
    
    -- Time period for metrics
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Mention counts
    total_mentions INTEGER DEFAULT 0,
    mentions_24h INTEGER DEFAULT 0,
    mentions_7d INTEGER DEFAULT 0,
    mentions_30d INTEGER DEFAULT 0,
    mentions_90d INTEGER DEFAULT 0,
    
    -- Sentiment
    avg_sentiment_7d DECIMAL(4,3) DEFAULT 0.000,
    avg_sentiment_30d DECIMAL(4,3) DEFAULT 0.000,
    sentiment_trend DECIMAL(4,3) DEFAULT 0.000, -- Change in sentiment
    
    -- Buzz score (calculated)
    buzz_score DECIMAL(5,1) DEFAULT 0.0, -- 0-100 normalized score
    buzz_rank INTEGER, -- Rank among all tracked companies
    
    -- Momentum
    news_momentum DECIMAL(4,2) DEFAULT 0.00, -- Rate of change
    is_trending BOOLEAN DEFAULT FALSE,
    trending_direction VARCHAR(10), -- 'up', 'down', 'stable'
    
    -- Price correlation (if available)
    price_correlation_7d DECIMAL(4,3),
    price_correlation_30d DECIMAL(4,3),
    
    -- Sources breakdown
    sources_breakdown JSONB DEFAULT '{}', -- {"mining_news_net": 5, "northern_miner": 3}
    
    -- Metadata
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for daily metrics per company
    CONSTRAINT unique_buzz_metric UNIQUE (ticker, exchange, metric_date)
);

-- Index for ticker lookups
CREATE INDEX IF NOT EXISTS idx_buzz_metrics_ticker ON news_buzz_metrics(ticker, exchange);

-- Index for trending companies
CREATE INDEX IF NOT EXISTS idx_buzz_metrics_trending ON news_buzz_metrics(is_trending, buzz_score DESC);

-- Index for buzz score ranking
CREATE INDEX IF NOT EXISTS idx_buzz_metrics_score ON news_buzz_metrics(metric_date, buzz_score DESC);

-- =============================================================================
-- HOT STOCKS VIEW
-- Companies currently "hot" in the news (high buzz score, trending up)
-- =============================================================================
CREATE OR REPLACE VIEW hot_stocks AS
SELECT 
    ticker,
    exchange,
    company_name,
    mentions_7d,
    mentions_30d,
    avg_sentiment_7d,
    buzz_score,
    news_momentum,
    trending_direction,
    price_correlation_7d,
    sources_breakdown,
    calculated_at,
    CASE 
        WHEN buzz_score >= 80 THEN 'Very Hot 🔥🔥🔥'
        WHEN buzz_score >= 60 THEN 'Hot 🔥🔥'
        WHEN buzz_score >= 40 THEN 'Warming Up 🔥'
        ELSE 'Normal'
    END AS heat_level
FROM news_buzz_metrics
WHERE metric_date = CURRENT_DATE
  AND is_trending = TRUE
ORDER BY buzz_score DESC;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to calculate buzz score
CREATE OR REPLACE FUNCTION calculate_buzz_score(
    mentions_7d INTEGER,
    mentions_30d INTEGER,
    avg_sentiment DECIMAL,
    momentum DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    base_score DECIMAL;
    sentiment_modifier DECIMAL;
    momentum_modifier DECIMAL;
BEGIN
    -- Base score from mentions (weighted recent higher)
    base_score := LEAST(50, (mentions_7d * 3 + mentions_30d * 0.5) / 2);
    
    -- Sentiment modifier (-10 to +10)
    sentiment_modifier := avg_sentiment * 10;
    
    -- Momentum modifier (-20 to +20)
    momentum_modifier := LEAST(20, GREATEST(-20, momentum * 20));
    
    -- Final score clamped 0-100
    RETURN LEAST(100, GREATEST(0, base_score + sentiment_modifier + momentum_modifier + 30));
END;
$$ LANGUAGE plpgsql;

-- Function to update buzz metrics for a company
CREATE OR REPLACE FUNCTION update_company_buzz_metrics(
    p_ticker VARCHAR(10),
    p_exchange VARCHAR(10) DEFAULT 'ASX'
) RETURNS void AS $$
DECLARE
    v_mentions_7d INTEGER;
    v_mentions_30d INTEGER;
    v_avg_sentiment DECIMAL;
    v_momentum DECIMAL;
    v_buzz_score DECIMAL;
BEGIN
    -- Calculate 7-day mentions
    SELECT COUNT(*) INTO v_mentions_7d
    FROM article_company_mentions acm
    JOIN news_articles na ON acm.article_id = na.id
    WHERE acm.ticker = p_ticker
      AND (acm.exchange = p_exchange OR acm.exchange IS NULL)
      AND na.published_date >= NOW() - INTERVAL '7 days';
    
    -- Calculate 30-day mentions
    SELECT COUNT(*) INTO v_mentions_30d
    FROM article_company_mentions acm
    JOIN news_articles na ON acm.article_id = na.id
    WHERE acm.ticker = p_ticker
      AND (acm.exchange = p_exchange OR acm.exchange IS NULL)
      AND na.published_date >= NOW() - INTERVAL '30 days';
    
    -- Calculate average sentiment
    SELECT COALESCE(AVG(na.sentiment_score), 0) INTO v_avg_sentiment
    FROM article_company_mentions acm
    JOIN news_articles na ON acm.article_id = na.id
    WHERE acm.ticker = p_ticker
      AND (acm.exchange = p_exchange OR acm.exchange IS NULL)
      AND na.published_date >= NOW() - INTERVAL '7 days'
      AND na.sentiment_score IS NOT NULL;
    
    -- Calculate momentum (7d vs previous 7d)
    DECLARE
        v_prev_mentions INTEGER;
    BEGIN
        SELECT COUNT(*) INTO v_prev_mentions
        FROM article_company_mentions acm
        JOIN news_articles na ON acm.article_id = na.id
        WHERE acm.ticker = p_ticker
          AND (acm.exchange = p_exchange OR acm.exchange IS NULL)
          AND na.published_date >= NOW() - INTERVAL '14 days'
          AND na.published_date < NOW() - INTERVAL '7 days';
        
        IF v_prev_mentions > 0 THEN
            v_momentum := (v_mentions_7d::DECIMAL - v_prev_mentions) / v_prev_mentions;
        ELSE
            v_momentum := CASE WHEN v_mentions_7d > 0 THEN 1.0 ELSE 0.0 END;
        END IF;
    END;
    
    -- Calculate buzz score
    v_buzz_score := calculate_buzz_score(v_mentions_7d, v_mentions_30d, v_avg_sentiment, v_momentum);
    
    -- Upsert the metric
    INSERT INTO news_buzz_metrics (
        ticker, exchange, metric_date,
        mentions_7d, mentions_30d,
        avg_sentiment_7d, news_momentum, buzz_score,
        is_trending, trending_direction
    ) VALUES (
        p_ticker, p_exchange, CURRENT_DATE,
        v_mentions_7d, v_mentions_30d,
        v_avg_sentiment, v_momentum, v_buzz_score,
        v_buzz_score >= 40 AND v_momentum > 0.1,
        CASE 
            WHEN v_momentum > 0.1 THEN 'up'
            WHEN v_momentum < -0.1 THEN 'down'
            ELSE 'stable'
        END
    )
    ON CONFLICT (ticker, exchange, metric_date) 
    DO UPDATE SET
        mentions_7d = EXCLUDED.mentions_7d,
        mentions_30d = EXCLUDED.mentions_30d,
        avg_sentiment_7d = EXCLUDED.avg_sentiment_7d,
        news_momentum = EXCLUDED.news_momentum,
        buzz_score = EXCLUDED.buzz_score,
        is_trending = EXCLUDED.is_trending,
        trending_direction = EXCLUDED.trending_direction,
        calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Update timestamp on news_articles
CREATE OR REPLACE FUNCTION update_news_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_news_articles_timestamp
    BEFORE UPDATE ON news_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_news_timestamp();

-- =============================================================================
-- SAMPLE DATA INSERTION (for testing)
-- =============================================================================
/*
-- Example: Insert a news article
INSERT INTO news_articles (url, url_hash, title, snippet, source_id, source_name, source_region, published_date, sentiment_score)
VALUES (
    'https://www.miningnews.net/article/sfr-drill-results',
    encode(sha256('https://www.miningnews.net/article/sfr-drill-results'::bytea), 'hex'),
    'Sandfire Resources Reports High-Grade Copper Discovery',
    'Sandfire Resources (ASX: SFR) announced exceptional drilling results at their flagship project...',
    'mining_news_net',
    'Mining News Net',
    'Australia',
    NOW() - INTERVAL '2 days',
    0.75
);

-- Example: Link article to company
INSERT INTO article_company_mentions (article_id, ticker, exchange, company_name, mention_type, headline_mention)
VALUES (1, 'SFR', 'ASX', 'Sandfire Resources', 'primary', TRUE);

-- Example: Update buzz metrics
SELECT update_company_buzz_metrics('SFR', 'ASX');
*/

COMMENT ON TABLE news_articles IS 'Stores scraped news articles from mining news sources';
COMMENT ON TABLE article_company_mentions IS 'Links news articles to mentioned companies';
COMMENT ON TABLE news_buzz_metrics IS 'Pre-calculated daily buzz metrics per company';
COMMENT ON VIEW hot_stocks IS 'Companies currently trending in mining news';
