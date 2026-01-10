#!/usr/bin/env python3
"""
Script to scrape historical events from Wikipedia's Selected Anniversaries page.
This script fetches events from https://en.wikipedia.org/wiki/Wikipedia:Selected_anniversaries/All
and generates an events.json file for the Flashback Game.

Usage:
    python3 scrape_wikipedia_events.py

Requirements:
    pip install requests beautifulsoup4
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime


def fetch_wikipedia_page(url):
    """Fetch the Wikipedia page content."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"Error fetching page: {e}")
        return None


def is_recurring_event(text):
    """Check if the event is a recurring event (holidays, observances)."""
    # Recurring events typically contain phrases like "Independence Day", "Holiday", etc.
    recurring_patterns = [
        r'Independence Day',
        r'National Day',
        r'Public Domain Day',
        r'Solemnity',
        r'Holiday',
        r'Observance',
        r'Day of',
        r'Feast of',
        r'Memorial Day',
        r'Remembrance Day',
    ]
    
    for pattern in recurring_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    
    return False


def is_birth_or_death(li_element):
    """Check if the list item contains birth or death information."""
    # Check for "(b. YYYY)" or "(d. YYYY)" patterns
    text = li_element.get_text()
    if re.search(r'\(b\.\s*\d{3,4}\)', text) or re.search(r'\(d\.\s*\d{3,4}\)', text):
        return True
    return False


def extract_year_from_link(link):
    """Extract year from a Wikipedia year link."""
    if link and link.get('href'):
        href = link.get('href')
        # Year links typically look like /wiki/1903
        match = re.search(r'/wiki/(\d{3,4})$', href)
        if match:
            return match.group(1)
    return None


def remove_pictured_phrase(text):
    """Remove the phrase '(pictured)' from the event text."""
    return re.sub(r'\s*\(pictured\)', '', text, flags=re.IGNORECASE)


def parse_events_from_month_page(month, day):
    """Parse events from a specific month/day Wikipedia page."""
    month_names = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    month_name = month_names[month - 1]
    url = f"https://en.wikipedia.org/wiki/Wikipedia:Selected_anniversaries/{month_name}_{day}"
    
    print(f"Fetching {month_name} {day}...")
    
    html_content = fetch_wikipedia_page(url)
    if not html_content:
        return []
    
    soup = BeautifulSoup(html_content, 'html.parser')
    events = []
    
    # Find the main content area
    content = soup.find('div', {'id': 'mw-content-text'})
    if not content:
        return []
    
    # Find all list items in the content
    list_items = content.find_all('li')
    
    for li in list_items:
        # Skip if it's a birth/death entry
        if is_birth_or_death(li):
            continue
        
        text = li.get_text()
        
        # Skip if it's a recurring event
        if is_recurring_event(text):
            continue
        
        # Try to find a year link in the list item
        year_links = li.find_all('a', href=re.compile(r'/wiki/\d{3,4}$'))
        
        if not year_links:
            continue
        
        # Get the first year mentioned (typically the event year)
        year = None
        for link in year_links:
            extracted_year = extract_year_from_link(link)
            if extracted_year:
                year = extracted_year
                break
        
        if not year:
            continue
        
        # Extract the event description
        # The event text typically comes before the year link
        event_text = ""
        for content in li.contents:
            if hasattr(content, 'name') and content.name == 'a':
                href = content.get('href', '')
                if re.search(r'/wiki/\d{3,4}$', href):
                    # This is a year link, stop here
                    break
            if hasattr(content, 'get_text'):
                event_text += content.get_text()
            elif isinstance(content, str):
                event_text += content
        
        # Clean up the event text
        event_text = event_text.strip()
        event_text = event_text.rstrip(':–-').strip()
        event_text = remove_pictured_phrase(event_text)
        
        # Skip if the event text is too short or empty
        if len(event_text) < 10:
            continue
        
        # Create the date in YYYY-MM-DD format
        date_str = f"{year}-{month:02d}-{day:02d}"
        
        # Validate the year is reasonable (not in the future, not too ancient)
        try:
            year_int = int(year)
            current_year = datetime.now().year
            if year_int > current_year or year_int < 1:
                continue
        except ValueError:
            continue
        
        events.append({
            "name": event_text,
            "date": date_str
        })
    
    return events


def scrape_all_events():
    """Scrape events from all days of the year."""
    all_events = []
    
    # Days per month (including leap day for February)
    # Note: Wikipedia has pages for February 29, so we include it
    days_in_month = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    
    for month in range(1, 13):
        for day in range(1, days_in_month[month - 1] + 1):
            events = parse_events_from_month_page(month, day)
            all_events.extend(events)
            
            # Be polite to Wikipedia servers
            import time
            time.sleep(0.5)
    
    return all_events


def main():
    """Main function to scrape events and save to JSON."""
    print("Starting Wikipedia events scraping...")
    print("This will take several minutes to complete.\n")
    
    events = scrape_all_events()
    
    print(f"\nTotal events scraped: {len(events)}")
    
    if events:
        # Save to events.json
        output_file = "events.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(events, f, indent=4, ensure_ascii=False)
        
        print(f"\nEvents saved to {output_file}")
        
        # Print a few sample events
        print("\nSample events:")
        for i, event in enumerate(events[:5]):
            print(f"{i+1}. {event['name']} ({event['date']})")
    else:
        print("No events were scraped. Please check your internet connection and try again.")


if __name__ == "__main__":
    main()
