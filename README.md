# ITSB Picnic Scoreboard — System Guide

This document explains the whole scoring system end to end: the Google Sheet, the Google Form scorekeepers use, and how both feed the public website. Written for whoever is coordinating the event, not just whoever built it.

---

## Quick links

| What | Link |
|---|---|
| **Google Form** (public — hand this to scorekeepers) | https://docs.google.com/forms/d/e/1FAIpQLSeCuPbfEeDxxmj38BzR3WvZ771SE2sW_Y0L4ZeuOMVo9UiQtA/viewform?usp=dialog |
| **Google Form** (editable — do not give) | https://docs.google.com/forms/d/1MsifLbxM6uGic2aTYyIaJp653tqAPwSyuPV-HJwzxwI/edit |
| **Public website** (live standings + leaderboards) | https://itsb-picnic.netlify.app/ |
| **Google Sheet** (scores, standings, leaderboards) | https://docs.google.com/spreadsheets/d/1yH31h0Hf8MDrBIcwyT6BzI2KXsv9ApzFxOlVdJeKSN8/edit?usp=sharing |

---

## How the whole thing fits together

The system has four moving parts:

1. **Google Form** — what scorekeepers actually fill out on their phones during the event.
2. **Google Sheet, raw response tab** — Google Forms writes every submission here automatically. You don't build or maintain this part; it's created and managed by Google Forms itself.
3. **Sync script** (`sync_form_to_score_entry.gs.js`, installed as an Apps Script trigger) — runs automatically the instant someone submits the form. It reads the raw response, works out which game and category were selected, and writes a clean row into the **Score Entry** tab.
4. **Score Entry tab → Division Standings / Individual Leaderboards tabs** — these two tabs never touch the Form directly. They contain formulas that constantly read every row in Score Entry and total everything up live. The moment step 3 happens, these two tabs update on their own.

Downstream of all that, if the website is wired up: the website fetches **published CSV versions** of Division Standings and Individual Leaderboards on a timer (roughly every 60 seconds) and displays them. Publishing those CSVs is a manual one-time setup step — see "Connecting to the website" below.

---

## Coordinator manual

### Before the event

- [ ] Confirm the Google Sheet has these tabs: **Score Entry**, **Division Standings**, **Individual Leaderboards**, **Rules**, **Lists**, and a hidden **_Calc** tab (leave `_Calc` alone — it's internal math, not meant to be read directly).
- [ ] Confirm the Google Form is built and its response destination is this Sheet.
- [ ] Confirm the sync script's trigger is installed (Sheet → Extensions → Apps Script → clock icon → should show one `onFormSubmit` trigger, `From spreadsheet`, `On form submit`).
- [ ] Submit one real test entry through the public Form for each rough category — an individual-leaderboard game (e.g. Hula Hoop) and a simple division-win game (e.g. Cornhole) — and confirm both land correctly in Score Entry with Division Standings updating.
- [ ] If using the website, publish both output tabs as CSV (see below) and paste the links into this README's Quick Links table.

### During the event — using the Form

Hand the **public Form link** to every scorekeeper. One form, no training needed beyond:

1. **What are you scoring?** — pick the game and what happened (e.g. "Bottle Flip — New Record"). This one answer drives everything else.
2. **Division** — which division the winner(s) belong to.
3. **Participant** — only needed for individual-leaderboard games (Water Balloon Toss, all 3 Paper Airplanes categories, Hula Hoop, Bottle Flip). Leave blank for simple division wins (Cornhole, Water Pong, Flip Cup).
4. **Score** — same rule as Participant: only for individual-leaderboard games. The field's own help text lists what unit to use per game (feet, seconds, or flip count) — **worth a heads-up to scorekeepers that "Closest to Ground Target (Hula Hoop)" is the one game where a *smaller* number wins**, since that's the easiest mistake to make.
5. **Entered By** — who's submitting.
6. **Notes** — optional, freeform.

A few game-specific notes worth passing on to scorekeepers directly:

- **Hula Hoop**: log each new personal best as a participant climbs toward 15 seconds — no need to log every single attempt below that. Once someone hits 15 seconds or more, log *every* attempt at 15s+, since each one earns a point and any of them could become the new longest-overall record.
- **Bottle Flip**: only the volunteer tracking records should log "New Record" entries, the moment a new record actually happens. The 5-point "current leader" bonus is fully automatic — there's no separate "final winner" step to remember.
- **Responses can be edited after submitting** — if a scorekeeper makes a typo, they can go back into their own submission and fix it rather than needing you to intervene.

### During the event — monitoring the Sheet

- **Score Entry** is the source of truth — every row here is one logged result.
- **Division Standings** and **Individual Leaderboards** are read-only in practice — they're 100% formulas. Don't type into them; if a number looks wrong, the fix is almost always in Score Entry (a miscategorized row, a typo in a Score value), not in the formulas themselves.
- Ties: two participants tying on a leaderboard score resolve to **whoever logged first** — no visible "tie" indicator. Two divisions tying on Total Points show as **co-rank 1**, with the next division jumping to rank 3 (standard competition ranking, not dense ranking).

### Connecting to the website

The website never talks to the Google Sheet or Form directly — it only reads two published CSV links, on a timer. To set that up:

1. In the Sheet: **File → Share → Publish to web**.
2. Choose the **Division Standings** tab specifically, format **CSV**, and publish. Copy the link.
3. Repeat for the **Individual Leaderboards** tab. Copy that link too.
4. Paste both links into the website's source code (the constants `STANDINGS_CSV_URL` and `LEADERBOARDS_CSV_URL`), and paste them into this README's Quick Links table as well.
5. The website polls both links roughly every 60 seconds — there's no manual "refresh" step needed after this point.

If a published CSV link ever needs to change (e.g. you rebuild the Sheet from scratch), both the website's source code and this README need updating together — they'll silently point at stale data otherwise.

### Troubleshooting

| Symptom | Likely cause |
|---|---|
| A Form response lands in the raw response tab but never appears in Score Entry | The sync trigger didn't fire or errored. Check Apps Script → Executions for a red/failed run and read the error message. |
| Trigger fails with "Cannot read properties of undefined (reading 'namedValues')" | The function was run manually instead of by a real submission, or the Form's response destination was linked programmatically rather than through the Forms UI — try unlinking and re-linking the destination through Responses → the Sheets icon, then recreate the trigger. |
| Sync script throws "No empty pre-built rows left" | Score Entry's 100 pre-built rows are full — add more rows (with the Points formula copied down) before the next submission. |
| A number in Division Standings or Individual Leaderboards looks wrong | Check Score Entry for a miscategorized row — wrong Game/Category text, or a Score entered in the wrong unit (most often the "smaller wins" Closest to Ground Target category). |
| Formulas show `#ERROR!` or `#N/A` after converting from Excel | Some formulas (particularly the leaderboard tie-breaking logic) were built and tested against Excel/LibreOffice, not Google Sheets' formula engine directly — flag the specific broken cell for a fix. |
