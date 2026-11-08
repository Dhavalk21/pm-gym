# PM Gym

A free practice gym for product managers, built and maintained by [Dhaval Kareliya](https://www.linkedin.com/in/dhavalk21/).

Most PM learning is passive: long courses, saved articles, frameworks that are read once and forgotten. PM Gym is the opposite. Every station is short, built around practice, and ends with a game that asks you to make real product decisions.

The format follows the learning techniques with the strongest evidence: trying a problem before the lesson, testing yourself instead of re-reading, spacing practice over time, and mixing related topics.

**Live site:** https://pmgym.netlify.app/

## What's inside

- **The gym floor:** 23 stations across six zones, in the order a product gets built: understand, design and build, measure, grow, decide, ship and lead. AI stations sit right after the foundations they build on.
- **Each station:** a warm-up, four short lessons with drills, a success and a failure case, a game, a task to apply it to your own product, a prompt to explain it in your own words, and a mastery check.
- **The playground:** every game also works on its own page, so you can share it with your team.

## Project structure

- `index.html`: home page with the gym floor, the session format and the playground
- `m1/`, `m2/` and so on: one page per station
- `games/`: standalone pages for each game
- `assets/`: shared styles, the station script, the games, and `plan.js`, which lists every station and its status

## Running it

Plain HTML, CSS and JavaScript with no build step. Open `index.html` in a browser, or serve the folder with any static host.

## Feedback

Spotted something wrong, or have an idea for a game? Message me on [LinkedIn](https://www.linkedin.com/in/dhavalk21/).
