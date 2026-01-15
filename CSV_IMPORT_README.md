# CSV Import Feature

## Overview
The Flashback Game now supports importing multiple events from a CSV file. This feature allows you to quickly add many events at once instead of adding them one by one.

## CSV File Format
The CSV file should contain **two columns**:
1. **Event Name** - A description of the historical event
2. **Date** - The date in YYYY-MM-DD format

### Example CSV Content
```csv
The first iPhone was released by Apple,2007-06-29
The Berlin Wall fell,1989-11-09
Neil Armstrong walked on the Moon,1969-07-20
World War II ended in Europe,1945-05-08
The Titanic sank,1912-04-15
```

### Advanced: Handling Commas in Event Names
If your event name contains commas, wrap it in double quotes:
```csv
"Armstrong, Neil walked on the Moon",1969-07-20
"Berlin Wall, a symbol of division, fell",1989-11-09
First iPhone released,2007-06-29
```

### Advanced: Escaping Quotes in Event Names
If your event name contains quotes, use two consecutive quotes (`""`) to escape them:
```csv
"The ""Big"" event happened",1999-12-31
"He said ""Hello"" to everyone",2024-01-15
```

## How to Use

1. **Prepare your CSV file**
   - Create a text file with a `.csv` extension
   - Add your events with the format: `Event Name,YYYY-MM-DD`
   - Each event should be on a new line
   - No header row is needed

2. **Import the file**
   - Scroll to the "Import Events from CSV" section
   - Click the "Choose File" button
   - Select your CSV file
   - Click the "Import CSV" button

3. **Review the results**
   - A popup will show how many events were successfully imported
   - If there were any errors, the first 5 error messages will be displayed
   - Imported events will appear in the "Unsorted Events" section

## Validation Rules

The CSV importer validates each line:
- **Event name** cannot be empty
- **Date format** must be YYYY-MM-DD (e.g., 2024-01-15)
- **Date validity** must be a real calendar date
- **Column count** must have exactly 2 columns

## Error Handling

If any line in your CSV file has errors, the importer will:
- Skip the invalid line
- Continue importing valid lines
- Show a summary of all errors at the end

### Common Errors
- `Not enough columns` - Missing the date column
- `Invalid date format` - Date not in YYYY-MM-DD format (e.g., using MM/DD/YYYY)
- `Event name is empty` - First column is blank
- `Invalid date` - Date doesn't exist (e.g., 2024-02-30)

## Sample File

A sample CSV file (`sample_events.csv`) is included in the repository for testing purposes.

## Tips

- Remove any header row from your CSV file before importing
- Make sure dates use 4-digit years (YYYY) not 2-digit years (YY)
- Use leading zeros for months and days (e.g., 2024-01-05, not 2024-1-5)
- If you have many events, consider breaking them into smaller CSV files for easier management
- After importing, you can still manually add more events or remove unwanted ones
