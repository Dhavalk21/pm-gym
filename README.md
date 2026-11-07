# PM Gym

Rebuilding product management foundations from scratch, in public. Short lessons, real practice, and a game for every module.

## What's here

- `index.html`: the home page, with the training plan and a progress barbell that loads a plate for every finished module
- `m1/`, `m2/` and so on: one page per station
- `assets/`: shared styles and the plan data

## Training plan

23 modules in six tracks: understand the problem, design and build, measure, grow and monetise, decide and plan, ship and lead. Three AI modules sit right after the foundations they build on.

Progress lives in `assets/plan.js`. Set a module's `status` to `"now"` or `"done"`, and add a `page` once its station page exists.

## Running it

Plain HTML, CSS and JavaScript with no build step. Open `index.html` in a browser, or deploy the folder as-is. The live site is on Netlify.

Built by [Dhaval Kareliya](https://www.linkedin.com/in/dhavalk21/).
