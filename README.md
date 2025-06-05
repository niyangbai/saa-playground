<div align="center">

# SAA Playground

![MIT License](https://img.shields.io/badge/license-MIT-green)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0-blue)
![Vite](https://img.shields.io/badge/built%20with-vite-646CFF)

</div>

## Overview

SAA Playground is a web-based interactive tool for Strategic Asset Allocation (SAA) optimization.  
Supports efficient frontier visualization, modular constraints, and portfolio statistics—all in the browser.

Built with [TensorFlow.js](https://www.tensorflow.org/js)

## Features

- **Modern Web UI**: Built with React and TypeScript for fast, interactive analysis.
- **TensorFlow.js Optimizer**: Gradient-based optimization, supports complex constraints and objectives.
- **Efficient Frontier Plot**: Visualize risk-return tradeoffs with live, customizable plots.
- **Modular Constraints**: Add, configure, and remove constraints (e.g., no shorting, group bounds, per-asset limits) via the UI.
- **Portfolio Analytics**: Display optimized weights and key statistics (return, risk, Sharpe ratio, etc.).


## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 16+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Install dependencies

```sh
npm install
```

### Start development server

```sh
npm run dev
```

- Open the URL shown in your terminal (usually `http://localhost:5173`).

### Build for production

```sh
npm run build
npm run preview
```


## Project Structure

```
src/
  App.tsx                # Main app UI
  main.tsx               # React entrypoint
  components/            # Asset input, constraints, plotting, etc.
  optimizer/             # Core optimization engine, objectives, constraints
public/
  index.html             # App entry HTML
vite.config.ts           # Vite project config
tsconfig.json            # TypeScript config
```

## Customization

- **Constraints**: Extend `ConstraintBuilder.tsx` and `constraints.ts` to add new types.
- **Objectives**: Add to `objectives.ts` and update `ObjectiveSelector.tsx` for more portfolio metrics.
- **Styling**: Customize UI via your preferred CSS/React styling method.

## Deployment

You can deploy the app to GitHub Pages or any static host:

1. Set `base` in `vite.config.ts` (e.g., `/your-repo-name/`).
2. Build: `npm run build`
3. Serve the `dist/` folder.

See the [Vite deployment guide](https://vitejs.dev/guide/static-deploy.html) for details.


## License

This project is licensed under the <b>GNU Affero General Public License v3.0</b> (AGPL-3.0).  
See the LICENSE file for details.

<blockquote>
    <b>Note</b>: Any modified versions must also be made publicly available under the same license if deployed.
</blockquote>

## Contact

For inquiries, please reach out via <a href="https://github.com/niyangbai/enhanced_shap/issues">GitHub Issues</a>.