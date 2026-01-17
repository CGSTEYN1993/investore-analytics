#!/usr/bin/env python3
"""
Add CSV Companies to Database and Fetch ALL Valuable Reports

This script fetches comprehensive data including:
- ASX Announcements (all types)
- Annual Reports
- Quarterly Reports (4Cs, 5Bs)
- JORC Resource/Reserve Reports
- Feasibility Studies (PFS, DFS, BFS)
- Technical Reports
- Investor Presentations
- Drilling Results
- Project Updates

Run locally with DATABASE_URL set to your Railway PostgreSQL.
"""

import os
import csv
import time
import logging
import requests
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Set, Tuple

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    print("Installing psycopg2-binary...")
    import subprocess
    subprocess.run(["pip", "install", "psycopg2-binary"])
    import psycopg2
    from psycopg2.extras import RealDictCursor

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
DATABASE_URL = os.environ.get('DATABASE_URL', '')

# ASX API endpoints
ASX_ANNOUNCEMENTS_URL = "https://asx.api.markitdigital.com/asx-research/1.0/companies/{}/announcements"
ASX_REPORTS_URL = "https://asx.api.markitdigital.com/asx-research/1.0/companies/{}/reports"
ASX_HEADER_URL = "https://asx.api.markitdigital.com/asx-research/1.0/companies/{}/header"

# Keywords for high-value mining documents
HIGH_VALUE_KEYWORDS = [
    # JORC and Resources
    'jorc', 'resource', 'reserve', 'mineral resource', 'ore reserve',
    'indicated', 'inferred', 'measured', 'probable', 'proven',
    # Studies
    'feasibility', 'pfs', 'dfs', 'bfs', 'pre-feasibility', 'definitive feasibility',
    'scoping study', 'technical study', 'economic assessment',
    # Drilling
    'drill', 'drilling', 'assay', 'intercept', 'intersection', 'metre',
    'core', 'rc drilling', 'diamond drilling',
    # Geology
    'geological', 'mineralisation', 'mineralization', 'grade', 'tonnage',
    'strike', 'deposit', 'ore body', 'orebody',
    # Reports
    'annual report', 'quarterly', '4c', '5b', 'activities report',
    'quarterly report', 'half year', 'appendix',
    # Project Updates
    'project update', 'exploration update', 'development update',
    'operational update', 'production',
    # Presentations
    'presentation', 'investor', 'agm', 'conference',
    # Commodities
    'gold', 'copper', 'lithium', 'nickel', 'iron ore', 'rare earth',
    'uranium', 'zinc', 'silver', 'cobalt',
]

# Document type classification
DOCUMENT_TYPES = {
    'jorc_report': ['jorc', 'resource estimate', 'reserve estimate', 'mineral resource', 'ore reserve'],
    'feasibility_study': ['feasibility', 'pfs', 'dfs', 'bfs', 'scoping study'],
    'drilling_results': ['drill', 'assay', 'intercept', 'intersection'],
    'quarterly_report': ['quarterly', '4c', '5b', 'activities report', 'appendix 4c', 'appendix 5b'],
    'annual_report': ['annual report', 'annual financial'],
    'investor_presentation': ['presentation', 'investor', 'agm', 'conference'],
    'project_update': ['project update', 'exploration update', 'development', 'operational'],
    'other': []
}

# CSV files to process
CSV_FILES = [
    r"c:\InvestOre_Analytics\asx_mining_exploration_batch_a.csv",
    r"c:\InvestOre_Analytics\asx_mining_exploration_batch_b.csv",
]


def classify_document(title: str) -> Tuple[str, int]:
    """
    Classify document type and assign priority score.
    Higher score = more valuable for extraction.
    """
    title_lower = title.lower()
    
    # Check each document type
    for doc_type, keywords in DOCUMENT_TYPES.items():
        for keyword in keywords:
            if keyword in title_lower:
                # Assign priority based on document type
                priorities = {
                    'jorc_report': 100,
                    'feasibility_study': 95,
                    'drilling_results': 90,
                    'quarterly_report': 80,
                    'annual_report': 75,
                    'investor_presentation': 70,
                    'project_update': 65,
                    'other': 50
                }
                return doc_type, priorities.get(doc_type, 50)
    
    # Check for high-value keywords
    for keyword in HIGH_VALUE_KEYWORDS:
        if keyword in title_lower:
            return 'mining_related', 60
    
    return 'other', 30


def is_valuable_document(title: str) -> bool:
    """Check if document is valuable for mining data extraction."""
    title_lower = title.lower()
    
    # High-value documents - always include
    for keyword in HIGH_VALUE_KEYWORDS:
        if keyword in title_lower:
            return True
    
    # Skip administrative/legal documents with low value
    skip_keywords = [
        'change of director', 'director resignation', 'cleansing notice',
        'becoming a substantial holder', 'ceasing to be', 'change of address',
        'section 708a', 'trading policy', 'share purchase plan',
        'notice of meeting', 'proxy form', 'constitution',
    ]
    
    for skip in skip_keywords:
        if skip in title_lower:
            return False
    
    # Include price-sensitive by default
    return True


def read_csv_companies(csv_path: str) -> List[Dict]:
    """Read companies from a CSV file."""
    companies = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            symbol = row.get('ASX Code', '').strip().upper()
            name = row.get('Company Name', '').strip()
            website = row.get('Official Website', '').strip()
            
            if symbol:
                companies.append({
                    'symbol': symbol,
                    'name': name,
                    'website': website
                })
    return companies


def get_all_csv_companies() -> List[Dict]:
    """Load all companies from all CSV files."""
    all_companies = []
    for csv_file in CSV_FILES:
        if os.path.exists(csv_file):
            companies = read_csv_companies(csv_file)
            all_companies.extend(companies)
            logger.info(f"Loaded {len(companies)} companies from {os.path.basename(csv_file)}")
        else:
            logger.warning(f"CSV not found: {csv_file}")
    
    # Deduplicate
    seen = set()
    unique = []
    for c in all_companies:
        if c['symbol'] not in seen:
            seen.add(c['symbol'])
            unique.append(c)
    
    return unique


def add_companies_to_database(conn, companies: List[Dict]) -> int:
    """Add companies to the companies table."""
    cursor = conn.cursor()
    added = 0
    
    for company in companies:
        try:
            cursor.execute("""
                INSERT INTO companies (
                    ticker, name, exchange, company_type,
                    primary_commodity, country, website, created_at
                ) VALUES (%s, %s, 'ASX', 'explorer', 'diversified', 'Australia', %s, NOW())
                ON CONFLICT (ticker, exchange) DO UPDATE SET 
                    name = EXCLUDED.name,
                    website = EXCLUDED.website
                RETURNING id
            """, (company['symbol'], company['name'], company['website']))
            
            result = cursor.fetchone()
            if result:
                added += 1
            conn.commit()
        except Exception as e:
            conn.rollback()
            logger.debug(f"Company insert note for {company['symbol']}: {e}")
    
    return added


def fetch_announcements(symbol: str, days_back: int = 365) -> List[Dict]:
    """Fetch ALL announcements for a company from ASX API."""
    headers = {
        'User-Agent': 'InvestOre-Analytics/1.0',
        'Accept': 'application/json'
    }
    
    all_documents = []
    
    try:
        # Fetch announcements (up to 500 to get comprehensive history)
        url = ASX_ANNOUNCEMENTS_URL.format(symbol)
        response = requests.get(url, headers=headers, params={'count': 500}, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            items = data.get('data', {}).get('items', [])
            
            cutoff = datetime.now() - timedelta(days=days_back)
            
            for ann in items:
                date_str = ann.get('date', '')
                title = ann.get('headline', '')
                
                try:
                    ann_date = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S.%fZ')
                    
                    if ann_date > cutoff:
                        # Classify the document
                        doc_type, priority = classify_document(title)
                        is_valuable = is_valuable_document(title)
                        
                        doc = {
                            'document_id': ann.get('documentKey', ''),
                            'symbol': symbol,
                            'title': title,
                            'date': date_str,
                            'url': f"https://cdn-api.markitdigital.com/apiman-gateway/ASX/asx-research/1.0/file/{ann.get('documentKey', '')}",
                            'is_price_sensitive': ann.get('isPriceSensitive', False),
                            'size': ann.get('fileSize', '0KB'),
                            'document_type': doc_type,
                            'priority': priority,
                            'is_valuable': is_valuable,
                            'source': 'announcements'
                        }
                        all_documents.append(doc)
                except ValueError:
                    pass
        
        # Also try to fetch reports endpoint for annual/quarterly reports
        try:
            reports_url = ASX_REPORTS_URL.format(symbol)
            response = requests.get(reports_url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                reports = data.get('data', [])
                
                for report in reports:
                    doc_id = report.get('documentKey', '')
                    # Avoid duplicates
                    if doc_id and not any(d['document_id'] == doc_id for d in all_documents):
                        title = report.get('headline', report.get('type', ''))
                        doc_type, priority = classify_document(title)
                        
                        all_documents.append({
                            'document_id': doc_id,
                            'symbol': symbol,
                            'title': title,
                            'date': report.get('date', ''),
                            'url': f"https://cdn-api.markitdigital.com/apiman-gateway/ASX/asx-research/1.0/file/{doc_id}",
                            'is_price_sensitive': False,
                            'size': report.get('fileSize', '0KB'),
                            'document_type': doc_type,
                            'priority': priority,
                            'is_valuable': True,  # Reports are always valuable
                            'source': 'reports'
                        })
        except Exception as e:
            logger.debug(f"Reports endpoint not available for {symbol}: {e}")
        
        # Sort by priority (highest first)
        all_documents.sort(key=lambda x: x['priority'], reverse=True)
        
    except Exception as e:
        logger.error(f"Error fetching {symbol}: {e}")
    
    return all_documents


def store_announcement(conn, announcement: Dict) -> bool:
    """Store announcement in database if not exists."""
    cursor = conn.cursor()
    try:
        doc_id = announcement['document_id']
        
        # Check if exists
        cursor.execute(
            "SELECT id FROM extracted_pdf_documents WHERE document_id = %s",
            (doc_id,)
        )
        if cursor.fetchone():
            return False
        
        # Insert with document type and priority
        cursor.execute("""
            INSERT INTO extracted_pdf_documents (
                document_id, document_key, symbol, announcement_date,
                announcement_title, pdf_url, full_text,
                extraction_method, is_processed, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, '', 'pending', false, NOW())
        """, (
            doc_id,
            f"{announcement['symbol']}_{doc_id}",
            announcement['symbol'],
            announcement['date'],
            announcement['title'],
            announcement['url']
        ))
        
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        logger.error(f"Error storing {doc_id}: {e}")
        return False
    finally:
        cursor.close()


def print_document_stats(documents: List[Dict]):
    """Print statistics about fetched documents."""
    type_counts = {}
    valuable_count = 0
    
    for doc in documents:
        doc_type = doc.get('document_type', 'other')
        type_counts[doc_type] = type_counts.get(doc_type, 0) + 1
        if doc.get('is_valuable'):
            valuable_count += 1
    
    logger.info(f"  Document breakdown:")
    for doc_type, count in sorted(type_counts.items(), key=lambda x: -x[1]):
        logger.info(f"    - {doc_type}: {count}")
    logger.info(f"  Valuable documents: {valuable_count}/{len(documents)}")


def main():
    if not DATABASE_URL:
        logger.error("DATABASE_URL not set!")
        logger.info("Set it with: $env:DATABASE_URL='postgresql://...'")
        return
    
    logger.info("=" * 60)
    logger.info("CSV Company Data Fetcher - ALL VALUABLE REPORTS")
    logger.info("=" * 60)
    logger.info("Fetching: Announcements, JORC Reports, Feasibility Studies,")
    logger.info("          Drilling Results, Quarterly/Annual Reports,")
    logger.info("          Investor Presentations, Project Updates")
    logger.info("=" * 60)
    
    # Connect with various retry attempts
    conn = None
    for attempt in range(3):
        try:
            logger.info(f"Connecting to database (attempt {attempt + 1})...")
            conn = psycopg2.connect(
                DATABASE_URL,
                connect_timeout=30,
                options='-c statement_timeout=60000'
            )
            logger.info("Connected successfully!")
            break
        except Exception as e:
            logger.warning(f"Connection attempt {attempt + 1} failed: {e}")
            if attempt < 2:
                time.sleep(5)
    
    if not conn:
        logger.error("Failed to connect to database after 3 attempts")
        return
    
    # Load companies
    companies = get_all_csv_companies()
    logger.info(f"Total unique companies: {len(companies)}")
    
    # Add to database
    added = add_companies_to_database(conn, companies)
    logger.info(f"Added/updated {added} companies in database")
    
    # Fetch all documents for each company
    total_fetched = 0
    total_stored = 0
    total_valuable = 0
    type_totals = {}
    
    for i, company in enumerate(companies):
        symbol = company['symbol']
        logger.info(f"\n[{i+1}/{len(companies)}] Fetching {symbol} - {company['name'][:40]}")
        
        # Fetch ALL documents (announcements + reports)
        documents = fetch_announcements(symbol, days_back=730)  # 2 years of history
        total_fetched += len(documents)
        
        # Count valuable documents
        valuable_docs = [d for d in documents if d.get('is_valuable')]
        total_valuable += len(valuable_docs)
        
        # Count by type
        for doc in documents:
            doc_type = doc.get('document_type', 'other')
            type_totals[doc_type] = type_totals.get(doc_type, 0) + 1
        
        # Store documents (prioritize valuable ones first, they're already sorted)
        stored = 0
        for doc in documents:
            if store_announcement(conn, doc):
                stored += 1
                total_stored += 1
        
        if documents:
            logger.info(f"  Found {len(documents)} documents ({len(valuable_docs)} valuable), stored {stored} new")
            if len(documents) > 10:
                # Show breakdown for companies with many documents
                print_document_stats(documents)
        
        time.sleep(0.5)  # Rate limiting
    
    conn.close()
    
    logger.info("\n" + "=" * 60)
    logger.info("FINAL SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Companies processed: {len(companies)}")
    logger.info(f"Total documents fetched: {total_fetched}")
    logger.info(f"Valuable documents: {total_valuable}")
    logger.info(f"New documents stored: {total_stored}")
    logger.info("\nDocument Types Breakdown:")
    for doc_type, count in sorted(type_totals.items(), key=lambda x: -x[1]):
        logger.info(f"  {doc_type}: {count}")
    logger.info("=" * 60)
    logger.info("The Railway worker will automatically process these through V1-V10")
    logger.info("High-priority documents (JORC, Feasibility, Drilling) will be")
    logger.info("processed first for maximum data extraction value.")


if __name__ == '__main__':
    main()
