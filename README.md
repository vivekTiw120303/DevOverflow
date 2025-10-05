# DevOverflow 🧠💬

A developer-focused Q&A platform like StackOverflow — built using Node.js, MongoDB, Socket.io, and Redis. Supports real-time answers, voting, tagging, search, and more.

## Features

- 🔐 JWT-based Auth
- 🧾 Ask Questions, Write Answers
- ✅ Upvote, Flag, Filter by Tags
- 📡 Real-time Notifications
- 🧠 User Profiles
- 📦 Dockerized + Redis Rate Limiting

## Tech Stack
- Node.js, Express, MongoDB (Atlas)
- Redis, Socket.io
- Docker, Render/Railway

**Live API Base URL:** `https://devoverflow-api-vivek.onrender.com`

## API Documentation

To test the API, use a tool like [Postman](https://www.postman.com/). Authenticated routes require a Bearer Token in the `Authorization` header.

### **Authentication (`/api/auth`)**

#### `POST /register`
Creates a new user account.
-   **Auth:** Not Required.
-   **Request Body:**
    ```json
    {
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    }
    ```
-   **Success Response (201):**
    ```json
    {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

#### `POST /login`
Logs in an existing user.
-   **Auth:** Not Required.
-   **Request Body:**
    ```json
    {
        "email": "test@example.com",
        "password": "password123"
    }
    ```
-   **Success Response (200):**
    ```json
    {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

### **Questions (`/api/questions`)**

#### `POST /`
Creates a new question.
-   **Auth:** Required (Bearer Token).
-   **Request Body:**
    ```json
    {
        "title": "How to deploy a Node.js app to Render?",
        "description": "I have a Node.js API with a MongoDB database and I need to deploy it.",
        "tags": ["nodejs", "deployment", "render"]
    }
    ```
-   **Success Response (201):** Returns the newly created question object.

#### `GET /`
Retrieves a list of all questions, sorted by most recent.
-   **Auth:** Not Required.

#### `POST /:id/answer`
Adds an answer to a specific question.
-   **Auth:** Required (Bearer Token).
-   **URL Params:** `id=[string]` The ID of the question.
-   **Request Body:**
    ```json
    {
        "content": "You should use a PaaS like Render and connect your GitHub repo!"
    }
    ```

#### `POST /:id/upvote`
Toggles an upvote on a question for the logged-in user.
-   **Auth:** Required (Bearer Token).
-   **URL Params:** `id=[string]` The ID of the question.
-   **Success Response (200):**
    ```json
    {
        "upvotes": 12
    }
    ```

#### `GET /tag/:tag`
Retrieves all questions that have a specific tag.
-   **Auth:** Not Required.
-   **URL Params:** `tag=[string]` The tag to filter by (e.g., `nodejs`).

#### `GET /search/:keyword`
Searches for questions where the keyword appears in the title or description.
-   **Auth:** Not Required.
-   **URL Params:** `keyword=[string]` The search term.

#### `GET /page/:page`
Retrieves a paginated list of questions (10 per page).
-   **Auth:** Not Required.
-   **URL Params:** `page=[number]` The page number to retrieve.

#### `POST /:id/flag`
Flags a question for review.
-   **Auth:** Required (Bearer Token).
-   **URL Params:** `id=[string]` The ID of the question.
-   **Note:** This endpoint modifies data and is implemented as a `POST` request to follow REST best practices.

---

## Local Setup

To run this project on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/vivekTiw120303/DevOverflow.git](https://github.com/vivekTiw120303/DevOverflow.git)
    cd DevOverflow
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file** in the root directory and add the following variables:
    ```
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    PORT=5000
    REDIS_HOST=127.0.0.1
    REDIS_PORT=6379
    ```
4.  **Start the server:**
    ```bash
    npm run dev
    ```
The server will be available at `http://localhost:5000`.
