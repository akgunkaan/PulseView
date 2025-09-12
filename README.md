## Project Summary

PulseView is a modern web application that leverages Artificial Intelligence to analyze, visualize, and describe changes between two remote sensing images. Given "before" and "after" satellite or aerial photos of an area, the platform automatically identifies significant changes, generates a natural language description of what happened (e.g., "a new building was constructed"), and overlays a visual change mask on an interactive map.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

-   **AI-Powered Change Analysis:** Provide two image URLs ("before" and "after") to have the backend analyze the differences using state-of-the-art AI models.
-   **Automated Change Captioning:** The system uses a Large Language Model (LLM) to generate a human-readable text description of the detected changes.
-   **Visual Change Mask:** A semi-transparent overlay is generated and displayed on the map, visually highlighting the exact areas where changes occurred.
-   **Interactive Map:** A fully interactive map interface (based on Leaflet) where users can see analysis results in a geographical context.
-   **Point of Interest (POI) Management:** Includes features for adding, viewing, and filtering custom points of interest on the map.
-   **Containerization:** All project components (frontend, backend) are containerized with Docker and can be easily run with `docker-compose`.

## Technology Stack

| Category                  | Technology                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Frontend**              | React, Leaflet                                                                                         |
| **Backend**               | Python (FastAPI)                                                                                       |
| **AI / Machine Learning** | PyTorch, Transformers, CLIP (Vision Encoder), Qwen2 (LLM)                                              |
| **Data Processing**       | GeoPandas, Pandas                                                                                      |
| **Database**              | PostGIS / PostgreSQL                                                                                   |
| **DevOps**                | Docker, Docker Compose                                                                                 |
| **Version Control**       | Git / GitHub                                                                                           |

## Getting Started

### Prerequisites

-   Docker
-   Docker Compose

### Installation & Running the Application

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd urbview-proje
    ```

3.  **Start the Docker containers:**

    ```bash
    docker-compose up --build
    ```
    **Note:** The first time you run this command, it will take a significant amount of time (15-30+ minutes) as it needs to download the AI models and Python/Node.js dependencies. Subsequent builds will be much faster.

4.  **Visit the application:**
    Open your browser and navigate to `http://localhost:3000`.

## How to Use

1.  Once the application is running, you will see a map of Berlin.
2.  In the top-left corner, find the **"Remote Sensing Change Analysis"** panel.
3.  Enter the URLs for a "before" and an "after" image of the same geographical area.
4.  Click the **"Analyze Changes"** button.
5.  After a few moments, the analysis results will appear:
    -   A text description of the changes will be shown in a panel at the bottom of the screen.
    -   A red, semi-transparent overlay will appear on the map, highlighting the areas where changes were detected.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.