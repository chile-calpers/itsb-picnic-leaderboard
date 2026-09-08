# Excel Workbook Generation Guide

Use this guide when generating or updating the picnic scoreboard workbook.

## Goal

Create an Excel workbook that can be used to record picnic results and publish standings to the scoreboard app. Keep the workbook readable on screen, preserve stable columns, and do not merge cells.

## Integration contract

The app reads a published CSV standings table. The standings sheet must use this exact structure:

```text
Rank,Division,Total Points,Water Balloon Toss,Cornhole,Water Pong,Flip Cup,Paper Airplanes,Bottle Flip,Hula Hoop,Others
```

Rules for the standings sheet:

- Row 1 is the only header row.
- Columns A-C must remain `Rank`, `Division`, and `Total Points`.
- Game columns start at column D and use the exact game names above.
- The final column, `Others`, is a catch-all for points not tied to a specific game (e.g., manual adjustments). It is not a Score Entry game and has no scoring rules of its own — it is entered directly on the Standings sheet.
- Do not add timestamps, division names, participant names, or other metadata to the standings sheet.
- Do not merge any cells.
- Publish this sheet as CSV after updating the results.

The score-entry sheet follows the existing template columns first:

```text
Timestamp,Game,Division,Participant,Score,Points,Entered By,Notes
```

Any game-specific or optional input columns must come after `Notes`. Never insert them between the fixed columns.

## Current game rules

- **Water Balloon Toss:** Open free play in duos. The longest successful duo toss earns 5 division points.
- **Cornhole:** Open play and tournament play. Game wins earn division points. Tournament winners receive a prize.
- **Water Pong:** Open play and tournament play using timed elimination rounds. Each round win earns 1 division point. Tournament winners receive a prize.
- **Flip Cup:** Competitive timed team rounds. The first team to flip all cups wins 1 division point. There is no limit to plays.
- **Paper Airplanes:** Farthest Flight, Longest Airborne / Hang Time, and Closest to Ground Target. Each category winner earns 1 division point.
- **Bottle Flip:** Each attempt lasts 30 seconds with no limit to tries. The first record and each successive winning record earn 1 division point. The final event winner earns 5 division points.
- **Hula Hoop:** Open free play. The longest overall hula hooper earns 5 division points. Each successful hoop lasting at least 15 seconds earns 1 division point.

Scavenger Hunt is intentionally excluded from this workbook until it is approved for the app.

## Recommended workbook sheets

1. **Standings**: The only sheet to publish as CSV for the app.
2. **Score Entry**: One result per row using the fixed columns followed by optional fields.
3. **Rules**: Human-readable game rules and scoring notes.
4. **Lists**: Divisions and game names used for data validation.

## Column layout

### Standings

```text
Rank | Division | Total Points | Water Balloon Toss | Cornhole | Water Pong | Flip Cup | Paper Airplanes | Bottle Flip | Hula Hoop | Others
```

### Score Entry

```text
Timestamp | Game | Division | Participant | Score | Points | Entered By | Notes | Category | Duration Seconds | Distance | Successful Flips | Record Type
```

The optional columns are deliberately at the end. Leave fields blank when they do not apply:

- `Category`: Paper Airplanes or Hula Hoop category.
- `Duration Seconds`: Hula Hoop duration. A successful Hula Hoop result must be at least 15.
- `Distance`: Water Balloon Toss or Paper Airplanes measurement.
- `Successful Flips`: Bottle Flip result.
- `Record Type`: Bottle Flip value such as `New record` or `Final winner`.

## Generator

Install the dependency once:

```powershell
py -m pip install openpyxl
```

Save this script as `generate_scoreboard_workbook.py` and run it from the repository root:

```python
from pathlib import Path
from openpyxl import Workbook
from openpyxl.formatting.rule import ColorScaleRule
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.styles import Alignment, Font, PatternFill, Border, Side

OUTPUT = Path("ITSB Picnic Scoreboard.xlsx")

DIVISIONS = ["TISD", "ESDD", "TBMD"]
GAMES = [
    "Water Balloon Toss",
    "Cornhole",
    "Water Pong",
    "Flip Cup",
    "Paper Airplanes",
    "Bottle Flip",
    "Hula Hoop",
]

STANDINGS_HEADERS = ["Rank", "Division", "Total Points", *GAMES, "Others"]
SCORE_HEADERS = [
    "Timestamp",
    "Game",
    "Division",
    "Participant",
    "Score",
    "Points",
    "Entered By",
    "Notes",
    "Category",
    "Duration Seconds",
    "Distance",
    "Successful Flips",
    "Record Type",
]

HEADER_FILL = PatternFill("solid", fgColor="123B59")
HEADER_FONT = Font(color="FFFFFF", bold=True)
THIN_BORDER = Border(bottom=Side(style="thin", color="D9E2E8"))


def style_header(sheet):
    for cell in sheet[1]:
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center")
    sheet.row_dimensions[1].height = 24
    sheet.freeze_panes = "A2"
    sheet.auto_filter.ref = sheet.dimensions


def set_widths(sheet, widths):
    for column, width in widths.items():
        sheet.column_dimensions[column].width = width


def add_table(sheet, name):
    ref = f"A1:{sheet.cell(sheet.max_row, sheet.max_column).coordinate}"
    table = Table(displayName=name, ref=ref)
    table.tableStyleInfo = TableStyleInfo(
        name="TableStyleMedium2",
        showFirstColumn=False,
        showLastColumn=False,
        showRowStripes=True,
        showColumnStripes=False,
    )
    sheet.add_table(table)


def add_list_validation(sheet, cell_range, formula):
    validation = DataValidation(type="list", formula1=formula, allow_blank=True)
    validation.error = "Choose a value from the list."
    validation.errorTitle = "Invalid value"
    sheet.add_data_validation(validation)
    validation.add(cell_range)


def build_workbook():
    workbook = Workbook()
    standings = workbook.active
    standings.title = "Standings"
    score_entry = workbook.create_sheet("Score Entry")
    rules = workbook.create_sheet("Rules")
    lists = workbook.create_sheet("Lists")

    # Standings is intentionally flat because this sheet is published as CSV.
    standings.append(STANDINGS_HEADERS)
    for index, division in enumerate(DIVISIONS, start=1):
        standings.append([index, division, 0, *([0] * len(GAMES)), 0])
    style_header(standings)
    set_widths(standings, {
        "A": 10,
        "B": 16,
        "C": 16,
        "D": 22,
        "E": 14,
        "F": 14,
        "G": 14,
        "H": 18,
        "I": 14,
        "J": 14,
        "K": 14,
    })
    standings.freeze_panes = "A2"
    standings.conditional_formatting.add(
        f"C2:C{len(DIVISIONS) + 1}",
        ColorScaleRule(start_type="min", start_color="F7F4EA", mid_type="percentile", mid_value=50, mid_color="F2B233", end_type="max", end_color="D86645"),
    )
    add_table(standings, "StandingsTable")

    # The first eight columns intentionally match score-entry-template.csv.
    score_entry.append(SCORE_HEADERS)
    for _ in range(100):
        score_entry.append([None] * len(SCORE_HEADERS))
    style_header(score_entry)
    set_widths(score_entry, {
        "A": 20,
        "B": 22,
        "C": 14,
        "D": 22,
        "E": 12,
        "F": 10,
        "G": 18,
        "H": 30,
        "I": 32,
        "J": 18,
        "K": 14,
        "L": 18,
        "M": 18,
    })
    score_entry.column_dimensions["A"].number_format = "yyyy-mm-dd hh:mm"
    score_entry.freeze_panes = "A2"
    add_list_validation(score_entry, "B2:B101", "=Lists!$B$2:$B$8")
    add_list_validation(score_entry, "C2:C101", "=Lists!$A$2:$A$4")
    add_table(score_entry, "ScoreEntryTable")

    # Rules is readable, but remains a normal unmerged table.
    rules_headers = ["Game", "Format", "Points", "Rules"]
    rules.append(rules_headers)
    rule_rows = [
        ["Water Balloon Toss", "Single winner", "5", "Open free play in duos. Longest successful duo toss wins."],
        ["Cornhole", "Repeatable wins", "Per game win", "Open play and tournament play. Tournament winners receive a prize."],
        ["Water Pong", "Repeatable wins", "1 per round win", "Open play and tournament play using timed elimination rounds. Tournament winners receive a prize."],
        ["Flip Cup", "Repeatable wins", "1 per round win", "Competitive timed team rounds. First team to flip all cups wins."],
        ["Paper Airplanes", "Categories", "1 per category", "Farthest Flight, Longest Airborne / Hang Time, and Closest to Ground Target."],
        ["Bottle Flip", "Leaderboard", "1 per new record, 5 final winner", "30 seconds per attempt with no limit to tries. Highest score at event end wins."],
        ["Hula Hoop", "Categories", "5 longest, 1 per 15+ second success", "Open free play. Each successful hoop must last at least 15 seconds."],
    ]
    for row in rule_rows:
        rules.append(row)
    style_header(rules)
    set_widths(rules, {"A": 24, "B": 22, "C": 30, "D": 85})
    rules.freeze_panes = "A2"
    for row in rules.iter_rows(min_row=2):
        for cell in row:
            cell.alignment = Alignment(wrap_text=True, vertical="top")
            cell.border = THIN_BORDER
    add_table(rules, "RulesTable")

    lists.append(["Divisions", "Games"])
    for index in range(max(len(DIVISIONS), len(GAMES))):
        lists.append([
            DIVISIONS[index] if index < len(DIVISIONS) else None,
            GAMES[index] if index < len(GAMES) else None,
        ])
    style_header(lists)
    lists.sheet_state = "hidden"

    workbook.properties.title = "ITSB Picnic Scoreboard"
    workbook.properties.subject = "Picnic game standings and score entry"
    workbook.save(OUTPUT)
    print(f"Created {OUTPUT.resolve()}")


if __name__ == "__main__":
    build_workbook()
```

## Publishing checklist

1. Keep `Standings` as a flat table with no merged cells.
2. Confirm the first three headers are exactly `Rank`, `Division`, and `Total Points`.
3. Confirm game headers exactly match the app game names, with `Others` as the final column.
4. Keep score-entry extras after `Notes`.
5. Export or publish only the `Standings` sheet as CSV for the app.
6. Do not include metadata columns in the standings breakdown. The app will treat columns after `Total Points` as breakdown columns only when their names match the configured games or are exactly `Others`.
7. Validate the workbook in Excel before publishing and check that filters and frozen headers work.
