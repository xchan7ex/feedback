# Universe3D React Application

This is a React version of the Universe3D landing page, converted from the original HTML/CSS/JavaScript project.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd "C:\Users\NETHA\Desktop\client react"
```

2. Install dependencies:
```bash
npm install
```

### Running the Development Server

To start the development server, run:
```bash
npm run dev
```

The application will open in your browser at `http://localhost:3000`

### Building for Production

To create a production build:
```bash
npm run build
```

To preview the production build:
```bash
npm run preview
```

## Project Structure

```
client react/
├── public/
│   └── TeamMembers/     # Team member images
├── src/
│   ├── components/       # React components
│   │   ├── modals/      # Modal components
│   │   ├── AboutUs.jsx
│   │   ├── Features.jsx
│   │   ├── Footer.jsx
│   │   ├── FooterCTA.jsx
│   │   ├── Hero.jsx
│   │   ├── Navigation.jsx
│   │   ├── Pricing.jsx
│   │   ├── Team.jsx
│   │   └── TechRail.jsx
│   ├── hooks/
│   │   └── useThreeHero.js  # Three.js integration
│   ├── App.jsx          # Main app component
│   ├── main.jsx        # Entry point
│   └── styles.css      # All styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Features

- ✅ Fully converted to React components
- ✅ Three.js 3D animations in Hero section
- ✅ Modal system for Demo, Video, and Contact forms
- ✅ Responsive navigation with mobile menu
- ✅ Intersection Observer for scroll animations
- ✅ Infinite scrolling tech rail
- ✅ All original functionality preserved

## Technologies Used

- React 18
- Vite
- Three.js
- CSS3 (original styles preserved)

## Notes

- The original HTML, CSS, and JavaScript files remain unchanged in the `Client` folder
- All team member images should be placed in `public/TeamMembers/`
- The application uses Vite for fast development and building

