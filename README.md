# Personalized AI-Powered Dashboard Portal

This project is a full-stack, single-page application (SPA) that provides users with a customizable dashboard to view and manage their daily details through a system of configurable widgets. The application is built with React for the frontend and Node.js/Express for the backend, and the entire stack is containerized with Docker for easy setup and deployment.

## Key Features

- **Customizable Grid Layout**: A responsive, 84-column grid where widgets can be added, removed, rearranged (drag-and-drop), and resized. Layouts are saved per user.
- **Modular Widgets**: A variety of widgets are available, each with its own settings.
  - **Task List**: A full-featured todo list.
  - **Weather**: Current weather and forecast for any location.
  - **News**: Top headlines for any topic from NewsAPI.
  - **Stocks**: Real-time stock prices from Alpha Vantage.
  - **Tweets**: Latest tweets from any public X (Twitter) account.
  - **Calendar**: A calendar view integrated with the task list.
- **AI Integration**: Each widget leverages the Google Gemini AI for summarization, suggestions, and analysis. The AI prompt for each widget is fully configurable by the user.
- **Real-time Notifications**: A WebSocket-based notification system alerts users to important events.
- **User Authentication**: Secure user registration and login with JWT-based authentication.
- **Containerized**: The entire application (frontend, backend, database) is managed with Docker Compose for a one-command setup.

## Project Structure

The project is organized into two main directories:

-   `./backend`: The Node.js/Express server.
    -   `controllers/`: Contains the business logic for API endpoints.
    -   `models/`: Mongoose schemas for the MongoDB database.
    -   `routes/`: API route definitions.
    -   `middleware/`: Custom middleware, including JWT authentication.
    -   `server.js`: The main application entry point.
    -   `Dockerfile`: Defines the container for the backend service.
-   `./frontend`: The React client application.
    -   `src/components/`: Reusable components, including all the widgets.
    -   `src/pages/`: Top-level page components (Dashboard, Login, etc.).
    -   `src/context/`: React context providers for global state (Auth, Notifications).
    -   `src/services/`: Modules for communicating with the backend API.
    -   `Dockerfile`: A multi-stage Dockerfile that builds the React app and serves it with Nginx.

## Getting Started

### Prerequisites

-   [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) must be installed on your machine.

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Create the environment file:**
    Navigate to the `backend` directory and create a `.env` file by copying the example file:
    ```bash
    cp backend/.env.example backend/.env
    ```

3.  **Configure API Keys:**
    Open the `backend/.env` file with a text editor and fill in the required API keys. You will need to obtain these from their respective services:
    -   `JWT_SECRET`: A long, random string of your choice for securing user sessions.
    -   `GEMINI_API_KEY`: [Google AI Studio](https://makersuite.google.com/)
    -   `NEWS_API_KEY`: [NewsAPI.org](https://newsapi.org/)
    -   `OPENWEATHERMAP_API_KEY`: [OpenWeatherMap](https://openweathermap.org/api)
    -   `TWITTER_BEARER_TOKEN`: [X (Twitter) Developer Portal](https://developer.twitter.com/)
    -   `ALPHA_VANTAGE_API_KEY`: [Alpha Vantage](https://www.alphavantage.co/support/#api-key)

4.  **Run the Application:**
    From the root directory of the project, run the following command:
    ```bash
    docker-compose up --build
    ```
    This will build the Docker images for the frontend and backend, start all the services, and set up the database.

5.  **Access the Application:**
    -   The frontend will be available at `http://localhost:80` (or just `http://localhost`).
    -   The backend API will be running on `http://localhost:5000`.

That's it! You can now register a new user and start using your personalized dashboard.
