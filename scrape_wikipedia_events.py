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
import time
from datetime import datetime


def fetch_wikipedia_page(url):
    """Fetch the Wikipedia page content."""
    # Wikipedia requires a User-Agent header to prevent blocking
    # See: https://meta.wikimedia.org/wiki/User-Agent_policy
    headers = {
        'User-Agent': 'FlashbackGameBot/1.0 (https://github.com/anhtr/flashback_game; Educational game project) Python/requests'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return response.text
    except requests.HTTPError as e:
        # Handle 404 errors gracefully (e.g., February 29 in non-leap years)
        if e.response.status_code == 404:
            print(f"Page not found (404): {url}")
            return None
        print(f"HTTP error fetching page: {e}")
        return None
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
    
    # Find the parser output div which contains the actual content
    parser_output = content.find('div', {'class': 'mw-parser-output'})
    if not parser_output:
        parser_output = content
    
    # Find all year links that could be event markers
    # Events start with a year link (e.g., <a href="/wiki/1726">1726</a>)
    year_links = parser_output.find_all('a', href=re.compile(r'^/wiki/\d{3,4}$'))
    
    for year_link in year_links:
        year = extract_year_from_link(year_link)
        if not year:
            continue
        
        # Validate the year is reasonable
        try:
            year_int = int(year)
            current_year = datetime.now().year
            # Allow dates from year 1 CE onwards, up to current year
            if year_int > current_year or year_int < 1:
                continue
        except ValueError:
            continue
        
        # Get the parent element (could be <li>, <p>, or other container)
        parent = year_link.parent
        if not parent:
            continue
        
        # Check if this is a birth/death entry
        if is_birth_or_death(parent):
            continue
        
        # Get the full text of the parent element
        full_text = parent.get_text()
        
        # Check if this is a recurring event
        if is_recurring_event(full_text):
            continue
        
        # Extract the event description
        # The format is typically: YEAR – event description
        # We need to get everything after the year and the dash
        event_text = ""
        
        # Find the position of the year link in the parent's contents
        contents = list(parent.children)
        year_link_index = -1
        for i, child in enumerate(contents):
            if child == year_link:
                year_link_index = i
                break
        
        if year_link_index == -1:
            continue
        
        # Collect text after the year link
        found_dash = False
        for i in range(year_link_index + 1, len(contents)):
            child = contents[i]
            
            # Skip until we find the dash/separator
            if not found_dash:
                if isinstance(child, str):
                    # Check for en-dash, em-dash, or hyphen followed by space
                    if re.search(r'^\s*[–—-]\s*', child):
                        found_dash = True
                        # Add the text after the dash
                        text_after_dash = re.sub(r'^\s*[–—-]\s*', '', child)
                        event_text += text_after_dash
                continue
            
            # After the dash, collect all content
            if hasattr(child, 'get_text'):
                event_text += child.get_text()
            elif isinstance(child, str):
                event_text += child
        
        # If we didn't find a dash, skip this entry
        if not found_dash:
            continue
        
        # Clean up the event text
        event_text = event_text.strip()
        event_text = remove_pictured_phrase(event_text)
        
        # Remove any trailing colons or dashes
        event_text = event_text.rstrip(':–-').strip()
        
        # Skip if the event text is too short or empty
        if len(event_text) < 10:
            continue
        
        # Create the date in YYYY-MM-DD format
        date_str = f"{year}-{month:02d}-{day:02d}"
        
        events.append({
            "name": event_text,
            "date": date_str
        })
    
    return events


def scrape_all_events():
    """Scrape events from all days of the year."""
    all_events = []
    
    # Days per month (including leap day for February)
    # Note: Wikipedia has pages for February 29, and we handle 404s gracefully
    days_in_month = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    
    for month in range(1, 13):
        for day in range(1, days_in_month[month - 1] + 1):
            events = parse_events_from_month_page(month, day)
            # If February 29 returns no events (404 or empty), that's okay
            all_events.extend(events)
            
            # Be polite to Wikipedia servers
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
