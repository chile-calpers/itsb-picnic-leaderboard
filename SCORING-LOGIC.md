# Scoring Logic

This is the plain-language reference for the calculation in `scoring.js`. The unit tests in `scoring.test.js` should stay aligned with this document.

## General behavior

- Start every configured division at 0 points.
- Only logged results for configured games are counted.
- Results for unknown divisions are ignored.
- Standings sort by total points, highest first.
- If totals are tied, divisions sort alphabetically by name.
- Points are recorded in the per-game breakdown as well as the division total.

## Single winner

Used by Water Balloon Toss.

- Only the most recently logged winner counts.
- The winner receives the game's `pointsForWin` value.
- Logging a new winner replaces the previous winner's points for that game.

## Repeatable wins

Used by Cornhole, Water Pong, and Flip Cup.

- Every logged result counts as one win.
- Each division receives `pointsPerWin` for every win it logged.

## Multiple categories

Used by Paper Airplanes and Hula Hoop.

- Each category is calculated independently.
- A non-repeatable category awards points only to its most recently logged winner.
- A repeatable category awards its category point value for every logged success.
- Category points contribute to the parent game's total in the standings breakdown.

## Individual leaderboards

Used by Bottle Flip and leaderboard-style categories.

- Results are evaluated in timestamp order.
- The first result establishes the record and earns `pointsForRecord`.
- A result earns another record point only when it beats the current record.
- For higher-is-better games, a larger score beats the record.
- For lower-is-better games, a smaller score beats the record.
- The final best result receives `pointsForTopScore` as an additional bonus.
- Equal scores do not set a new record; the earlier result remains the winner.

## Scavenger Hunt

Scavenger Hunt is intentionally excluded from the digital scoring calculation. Its points must be tracked separately and added outside the website standings.

## Running the tests

From the repository root:

```powershell
node --test scoring.test.js
```
