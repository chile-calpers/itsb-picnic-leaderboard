# ITSB Picnic Leaderboard

A simple scoreboard and game guide for the ITSB picnic. Open the site in a browser to view the current standings and the rules for every game.

## Using the scoreboard

The site has two tabs:

- **Standings** shows each division's total points and a points breakdown by game.
- **Game Rules** lists every game. Select a game to expand its description, scoring method, categories, and notes.

Standings are loaded from the published event results. Refresh the page if a newly recorded result does not appear immediately.

## Divisions

- TISD
- ESDD
- TBMD

## Game rules

### Water Balloon Toss

Teams of two from the same division toss a water balloon back and forth. Each successful catch allows the team to step farther apart.

The team with the longest successful toss wins the challenge and earns **5 points** for its division.

### Cornhole

Open play is available throughout the event. Play to 11 points. After three consecutive wins, the winning team rotates out so others can play.

- A bag on the board is worth 1 point.
- A bag through the hole is worth 3 points.
- Opposing bags cancel each other out. Only net points count for the round.
- Each recorded round win earns **1 point** for the winning division.

### Water Pong

Teams of two play one-minute rounds to eliminate as many cups as possible.

The team that eliminates the most cups wins the round and earns **1 point** for its division. A winning team may stay on for up to two consecutive wins before rotating out. Each round win earns another point.

This is an ongoing activity and needs two tables and 24 cups.

### Mini Flip Cup

Teams may have 2, 4, 6, or more players. Each team has three cups, with one person assigned to each cup.

Every player must successfully flip their cup. The first team to flip all three cups wins the round and earns **1 point** for its division.

This is an ongoing, self-reported activity. Use regular solo cups rather than the mini flip-cup board.

### Paper Airplanes

Fold a paper airplane and compete in three categories:

- **Farthest Flight:** 1 point
- **Longest Airborne / Hang Time:** 1 point
- **Closest to Ground Target (Hula Hoop):** 2 points

For the ground-target category, the airplane must land inside the target to score. Paper is provided. A volunteer should record each category winner.

### Bottle Flip

This is a timed, single-player challenge. Each attempt lasts 30 seconds. Count the number of successful bottle flips.

The highest score on the all-day leaderboard earns **5 points** for that player's division. Use a quarter-filled Kirkland 16 oz water bottle.

## Scoring summary

| Game | Scoring | Division points |
| --- | --- | ---: |
| Water Balloon Toss | One overall winner | 5 |
| Cornhole | Round wins | 1 per win |
| Water Pong | Round wins | 1 per win |
| Mini Flip Cup | Round wins | 1 per win |
| Paper Airplanes | Category winners | 1, 1, or 2 |
| Bottle Flip | Best score of the day | 5 |

## Project files

- `index.html` contains the complete scoreboard, styling, game data, and rules interface.
- `score-entry-template.csv` is a template for recording event results.

## Local preview

Because this is a standalone HTML page, it can be opened directly in a browser:

1. Download or clone this repository.
2. Open `index.html`.

The project is also suitable for GitHub Pages because it has an `index.html` file at the repository root.