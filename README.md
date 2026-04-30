# Trip Organizer - Student Tracking System

A system for tracking student locations during school trips.

## Screenshots
**Login Screen:**
![Login Screen](https://github.com/user-attachments/assets/c08e7ae9-1a47-4dbb-bf5a-09c76940de37)

**Registration Screen:**
![Registration Screen](https://github.com/user-attachments/assets/57e5acd2-d44b-4acf-b2c7-3cc9cdcda9d3)


**Home Page (Dashboard & Map):**
![Home Page](https://github.com/user-attachments/assets/9bf014e5-6f0e-4092-8b9d-b645d6fc8538)

## Tech Stack

* **Backend:** Python, FastAPI, SQLAlchemy, uv
* **Frontend:** React, React-Leaflet, Axios
* **Database:** PostgreSQL (Supabase)

## Installation and Setup

### 1. Backend Setup

Open a terminal and navigate to the backend directory:

`cd backend`

Create and activate a local virtual environment:

`python -m venv venv`

`source venv/Scripts/activate`

Install all the required dependencies from the requirements file:

`pip install -r requirements.txt`

Run the local server:

`uv run uvicorn main:app --reload`

The backend API will run on http://localhost:8000.



### 2. Frontend Setup

Open a new terminal and navigate to the frontend directory:

`cd frontend`

Install the required Node modules:

`npm install`

Start the React development server:

`npm run dev`

The application will open in the browser (usually at http://localhost:5173).



## Simplifying Assumptions

1. **Simulated GPS:** Since I don't have real GPS data, I use random coordinates and save them in the database. When the user clicks the "Simulate" button, we get a new location.
2. **Air-Distance Calculation:** Distances for alerts are calculated in a straight line between two points (latitude and longitude), without checking real streets or buildings.
