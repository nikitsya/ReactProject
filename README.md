# Goals Dashboard

An interactive React mini-dashboard for browsing and managing goal-related examples (Goal/Targets):  
filtering, searching, sorting, favorites, rating, editing, and adding new rows.

## Features

- Loads data from `json/data.json`
- Displays data in table and card views (mobile-friendly)
- Filters items by tags
- Searches by number, titles, descriptions, and tags
- Sorts data by columns
- Supports adding, editing, and deleting records
- Includes favorites and rating for each item
- Provides tag management via a dedicated modal (Tags Manager)

## Tech Stack

- React 16 (via CDN)
- JavaScript (ES6+)
- HTML5 + SCSS/CSS
- UI template: SB Admin (Start Bootstrap)

## Screenshots

<table>
  <tr>
    <td><img src="./img/screenshots/Screenshot%202026-02-18%20at%2022.34.53.png" alt="Main dashboard view" width="100%"></td>
    <td><img src="./img/screenshots/Screenshot%202026-02-18%20at%2022.35.02.png" alt="Table and navigation" width="100%"></td>
  </tr>
  <tr>
    <td><img src="./img/screenshots/Screenshot%202026-02-18%20at%2022.35.11.png" alt="Filtering and search" width="100%"></td>
    <td><img src="./img/screenshots/Screenshot%202026-02-18%20at%2022.35.15.png" alt="Add row modal" width="100%"></td>
  </tr>
  <tr>
    <td><img src="./img/screenshots/Screenshot%202026-02-18%20at%2022.35.19.png" alt="Tag management" width="100%"></td>
    <td><img src="./img/screenshots/Screenshot%202026-02-18%20at%2022.35.27.png" alt="Mobile card layout" width="100%"></td>
  </tr>
</table>

## Quick Start

1. Clone the project:
   ```bash
   git clone <repo-url>
   cd ReactProject
   ```
2. Run it locally with any static server (for example):
   ```bash
   npx serve .
   ```
3. Open the URL shown in the terminal in your browser.

## Project Structure

- `index.html` - main page template
- `jsx/main-script.jsx` - React components and app logic
- `json/data.json` - source data
- `css/`, `scss/` - styles
- `img/screenshots/` - UI screenshots
