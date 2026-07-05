# Hotel & Restaurant Booking System

A web application for hotel and restaurant management, enabling users to view the menu, manage cart contents, place orders, and apply coupons. It features a React frontend and an Express/Node.js backend with MongoDB storage and Cloudinary integration for image hosting.

---

## Project Structure

The project is structured as a monorepo-style workspace:

*   **`client/`**: React application built with Vite and Tailwind CSS.
*   **`server/`**: Express.js server providing REST APIs for authentication, menu items, orders, and coupons.
*   **Root Folder**: Configured with concurrent execution scripts to run both client and server easily.

---

## Prerequisites

Before running the application, make sure you have the following installed:
*   [Node.js](https://nodejs.org/) (v16 or higher recommended)
*   [MongoDB](https://www.mongodb.com/) (either running locally or a MongoDB Atlas cloud URI)
*   A [Cloudinary](https://cloudinary.com/) account (optional, for image uploads/storage)

---

## Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone <your-repository-url>
    cd Resturant
    ```

2.  **Install Dependencies**
    From the root directory, run the helper command to install dependencies for the root, frontend client, and backend server all at once:
    ```bash
    npm run install-all
    ```

3.  **Configure Environment Variables**
    Navigate to the `server/` directory and configure the environment variables:
    - Copy the template file:
      ```bash
      cp server/.env.example server/.env
      ```
    - Open `server/.env` and replace the placeholder values with your actual configuration parameters:
      *   `PORT`: Port for the backend API server (defaults to `5000`).
      *   `MONGO_URI`: Your MongoDB database connection string.
      *   `JWT_SECRET`: A secret string used to sign authentication tokens.
      *   `CLOUDINARY_*`: Cloudinary cloud name, API key, and API secret for image storage.

---

## Running the Application

To run both the server and the client concurrently in development mode:

1.  From the **root directory**, run:
    ```bash
    npm run dev
    ```
2.  The frontend client will start at: [http://localhost:5173](http://localhost:5173)
3.  The backend server will run at: [http://localhost:5000](http://localhost:5000)

### Running Separately

If you prefer to run the client or server individually, you can use:

*   **Run Server Only**: `npm run server`
*   **Run Client Only**: `npm run client`
