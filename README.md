# 🧬 FuseIris: Genetic Color Palette Generator

FuseIris is an interactive, gamified color palette exploration tool. Unlike traditional color pickers, FuseIris allows users to **"breed" color palettes together** using a genetic algorithm to discover millions of unique, harmonious combinations.

> Experience a digital ecosystem defined by color. Your palette dictates the mood; we handle the code.

---

## ✨ Key Features

### 🧬 Genetic Palette Breeding

- **Drag & Drop Interface:** Drag one palette onto another to fuse them.  
- **Weighted Mixing:** The engine uses a genetic algorithm to mix RGB values of parent palettes with randomized weights, creating "offspring" that inherit traits from both parents.  
- **Collision Detection:** Ensures every generated palette is unique.  
- **Dynamic Naming:** Child palettes automatically inherit and combine names from their parents  
  - Example: **"Sunset" + "Ocean" = "Sunset Ocean Remix"**

---

### 📱 Cross-Platform Interactions

- **Desktop:** Native HTML5 Drag and Drop API  
- **Mobile:** Custom-built touch gesture system with "Ghost" elements for complex drag interactions  
- **Haptic Feedback:** Vibration feedback on mobile devices during interactions

---

### 👁️ Contextual Visualizer

- **Live Preview:** Click the "Eye" icon to instantly see how a palette looks on a modern landing page mock-up  
- **CSS Export:** One-click export of CSS variables for immediate use:

    :root {
      --color-primary: #ff5733;
      --color-secondary: #33c4ff;
    }

---

### 🛠️ Tools & Usability

- **Smart Search:** Filter by name, hex code, or tags (e.g., Neon, Pastel, Dark Mode)  
- **Creation Suite:** Manually build custom palettes from scratch  
- **Persistence:** All created and bred palettes are saved locally to your browser  
- **Dark/Light Mode:** Fully responsive UI adaptable to system preferences or manual toggles

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)  
- npm or yarn  

---

### Installation

#### 1. Clone the repository

    git clone https://github.com/yourusername/fuseiris.git
    cd fuseiris

#### 2. Install dependencies

    npm install

#### 3. Install required packages (if not already in package.json)

    npm install lucide-react tailwindcss

#### 4. Run the development server

    npm run dev

---

## 🎨 How "Breeding" Works

The core logic resides in the `handleBreedingLogic` function.

### Process Overview

1. **Selection**  
   User drags Parent A and drops it onto Parent B.

2. **Crossover**  
   The engine iterates through the 4 colors of the palettes.

3. **Mutation (Weighted Mixing)**  
   For each color slot, a random weight between `0.1` and `0.9` is generated:

    // Simplified logic  
    const weight = 0.1 + (Math.random() * 0.8);  
    const newColor = mixColors(parentA[i], parentB[i], weight);

This ensures the same parent set produces different "siblings."

4. **Validation**  
   The new palette is checked against the existing database to prevent duplicates.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React  
- **Styling:** Tailwind CSS  
- **Icons:** Lucide React  
- **State Management:** React Hooks (useState, useReducer, useContext)  
- **Performance Optimizations:** React.memo & useCallback for efficient rendering

---

## 📂 Project Structure

The application maintains a lightweight, centralized design:

    App.jsx
    ├── PaletteCard
    ├── ContextVisualizer
    ├── BreedingOverlay
    ├── CreateModal
    └── TouchDragOverlay

### Component Breakdown

- **PaletteCard:** Displays individual palettes  
- **ContextVisualizer:** Modal for previewing palettes on a mock website  
- **BreedingOverlay:** Animation overlay during palette fusion  
- **CreateModal:** Custom palette creation form  
- **TouchDragOverlay:** Visual "ghost" element for mobile dragging

---

## 🤝 Contributing

Contributions are what make the open-source community such a great place to learn and grow!

1. Fork the Project  
2. Create your Feature Branch  

    git checkout -b feature/AmazingFeature

3. Commit your Changes  

    git commit -m 'Add some AmazingFeature'

4. Push to the Branch  

    git push origin feature/AmazingFeature

5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## ❤️ Acknowledgments

- Built with love by **Undrstanding**  
- Inspired by genetic algorithms and color theory  
- Icons provided by the amazing **Lucide** library

---

🎨 **FuseIris — Where colors evolve.**
