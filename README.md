# Lightning Auto Service ADAS Profit Calculator

A responsive, browser-only calculator for estimating per-vehicle, monthly, and annual ADAS revenue and gross profit. It uses semantic HTML, CSS, and native JavaScript modules with no build step or runtime dependencies.

## Run locally

ES modules require the project to be served over HTTP. From this directory, run:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Configuration

- Update prices, margins, defaults, and brand details in `js/config.js`.
- Update manufacturers, supported years, and calibration estimates in `js/vehicle-data.js`.
- The calculation engine in `js/calculator.js` uses integer cents and contains no DOM code.

## Validation

Run the dependency-free calculation tests with:

```sh
node --test tests/calculator.test.mjs
```

The required 2026 Audi scenario is included.

## Deploy to Vercel

Import this directory as a new Vercel project. Leave the framework preset as **Other**, the build command blank, and the output directory as `.`. Deploy. The same files can also be uploaded directly to Netlify or GitHub Pages.

## Important estimate note

The calculator provides generalized financial assumptions, not verified OEM repair requirements. Always confirm procedures using the VIN, installed equipment, vehicle configuration, repair details, and current OEM service information.
