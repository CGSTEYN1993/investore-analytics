#!/usr/bin/env python3
"""Analyze JSE debug HTML to understand structure."""
import re

with open('backend/downloads/jse_announcements/jse_page_debug.html', 'r', encoding='utf-8') as f:
    c = f.read()

print(f"HTML length: {len(c)} chars")
print()

# Find any class attributes containing 'sens'
sens_classes = re.findall(r'class="[^"]*sens[^"]*"', c, re.I)
print(f"Classes with 'sens': {len(sens_classes)}")
for cls in sens_classes[:5]:
    print(f"  {cls}")
print()

# Find sensItemContainer
sens_items = re.findall(r'sensItemContainer', c, re.I)
print(f"sensItemContainer occurrences: {len(sens_items)}")
print()

# Find any id attributes  
ids = re.findall(r'id="([^"]+)"', c)
print(f"IDs found: {len(ids)}")
for i in ids[:15]:
    print(f"  {i}")
print()

# Find any input buttons
buttons = re.findall(r'<input[^>]+type="button"[^>]+>', c, re.I)
print(f"Input buttons: {len(buttons)}")
for b in buttons:
    val = re.search(r'value="([^"]*)"', b)
    cls = re.search(r'class="([^"]*)"', b)
    print(f"  Value: {val.group(1) if val else 'N/A'}, Class: {cls.group(1) if cls else 'N/A'}")
print()

# Find any 7days or 30days references
day_refs = re.findall(r'(7|30)\s*days?', c, re.I)
print(f"Day references: {len(day_refs)}")
print()

# Find any PDF links
pdf_links = re.findall(r'senspdf\.jse\.co\.za', c)
print(f"PDF links (senspdf.jse.co.za): {len(pdf_links)}")
print()

# Find any announcements-related divs
ann_divs = re.findall(r'<(div|ul|li)[^>]*(?:announcement|sens)[^>]*>', c, re.I)
print(f"Announcement-related elements: {len(ann_divs)}")
for d in ann_divs[:5]:
    print(f"  {d[:100]}")
print()

# Check for SharePoint framework
sharepoint = len(re.findall(r'SharePoint|_spPage|sp\.js|clienttemplates|clientrenderer', c, re.I))
print(f"SharePoint references: {sharepoint}")

# Look for loading spinners or placeholders
loading = len(re.findall(r'loading|spinner|ms-loading|wait', c, re.I))
print(f"Loading indicators: {loading}")

# Check if there's a main content area
main_content = re.search(r'<div[^>]+id="[^"]*content[^"]*"[^>]*>(.*?)</div>', c, re.I | re.DOTALL)
if main_content:
    print(f"\nMain content div found, length: {len(main_content.group(1))}")
    
# Look for any JavaScript variables related to announcements
js_vars = re.findall(r'var\s+\w*(?:sens|announcement|data)\w*\s*=', c, re.I)
print(f"JS vars with sens/announcement/data: {len(js_vars)}")
for v in js_vars[:3]:
    print(f"  {v}")
