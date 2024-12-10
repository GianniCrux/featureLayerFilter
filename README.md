# React + TypeScript + Vite

## Description

A TypeScript-based app using ArcGIS to display a 2D map with multiple layers. Users can select a layer, input a population threshold, and filter places displayed on the map based on that value. The app highlights the filtered locations, sorts them by population, and draws a line connecting the place with the least population to the one with the most. Clicking the line displays its length.

### Key Features:
- **Layer Selection**: Users can choose from multiple map layers and apply population filtering.
- **Population Filtering**: Highlights places where population exceeds the specified threshold.
- **Polyline Creation**: Draws a line between the places with the lowest and highest population.
- **Line Interaction**: Clicking the line shows its length.

### Key Methods Used:
- **highlight()**: Highlights the selected features on the map.
- **goTo()**: Centers the map on the selected features.
- **Graphic**: Used to display the polyline and its associated data (e.g., total population).
- **Polyline**: Draws a line between the lowest and highest population places.
- **queryFeatures()**: Queries the layer for places based on the population threshold.
- **PopupTemplate**: Displays the total population and length of the line when clicked.
- **geometryEngineAsync**: Used to calculate the length of the polyline and check for intersections.

### Disclaimer:
This app is intended purely for educational and practice purposes. It is not meant for real-world use or production environments. The functionality and performance may not be suitable for real-time or large-scale applications.

