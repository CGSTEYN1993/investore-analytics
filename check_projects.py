import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def check_projects():
    url = 'postgresql+asyncpg://postgres:WytFJxzonHcnryEeIIjSgpJvnxeYHvOj@monorail.proxy.rlwy.net:24727/railway'
    engine = create_async_engine(url, connect_args={"ssl": "require"})
    
    async with engine.connect() as conn:
        # Check project count
        result = await conn.execute(text('SELECT COUNT(*) FROM extracted_projects'))
        count = result.scalar()
        print(f'Projects in extracted_projects: {count}')
        
        # Check if table exists and has proper structure
        if count == 0:
            result = await conn.execute(text('''
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'extracted_projects'
                ORDER BY ordinal_position LIMIT 15
            '''))
            cols = [r[0] for r in result.fetchall()]
            print(f'Table columns: {cols}')
            
            # Check if there are projects in any related table
            result = await conn.execute(text('SELECT COUNT(*) FROM companies'))
            print(f'Companies: {result.scalar()}')
        else:
            # Show sample projects
            result = await conn.execute(text('''
                SELECT symbol, project_name, current_phase, exchange 
                FROM extracted_projects 
                LIMIT 5
            '''))
            for row in result.fetchall():
                print(f'  {row[0]}: {row[1]} ({row[2]}) - {row[3]}')
    
    await engine.dispose()

if __name__ == '__main__':
    asyncio.run(check_projects())
