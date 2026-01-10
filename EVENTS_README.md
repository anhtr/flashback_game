# Wikipedia Events Scraper

This directory contains scripts for generating event data for the Flashback Game.

## Scripts

### scrape_wikipedia_events.py

This script scrapes historical events from Wikipedia's Selected Anniversaries pages.

**Requirements:**
```bash
pip install requests beautifulsoup4
```

**Usage:**
```bash
python3 scrape_wikipedia_events.py
```

**Features:**
- Scrapes events from all 366 days of the year
- Excludes recurring events (holidays, observances)
- Excludes birth and death dates
- Removes "(pictured)" phrases from event descriptions
- Generates events.json in the required format

**Note:** This script requires internet access to en.wikipedia.org. The scraping process takes several minutes to complete as it fetches data from 366 different pages.

### generate_sample_events.py

This script generates a sample set of historically accurate events for testing purposes.

**Usage:**
```bash
python3 generate_sample_events.py
```

This script is useful when you don't have internet access or want to quickly test the application with a smaller dataset.

## Output Format

Both scripts generate an `events.json` file with the following format:

```json
[
    {
        "name": "Event description",
        "date": "YYYY-MM-DD"
    }
]
```

## Future Updates

To update the events with fresh data from Wikipedia:

1. Ensure you have internet access to en.wikipedia.org
2. Install the required dependencies: `pip install requests beautifulsoup4`
3. Run: `python3 scrape_wikipedia_events.py`
4. Wait for the scraping to complete (several minutes)
5. The new `events.json` file will be generated

The script is designed to be re-run periodically as Wikipedia's Selected Anniversaries pages are updated.
