

---

# Twitter Backend

This project is a backend implementation for a Twitter-like application. It provides RESTful APIs for user registration, login, posting tweets, liking/unliking posts, commenting on posts, and handling notifications.

## Features

- **User Authentication**: Sign up, login, and logout functionality with JWT-based token authentication.
- **Posts**: Users can create, delete, and view posts. Posts can include text and images, with image uploads handled by Cloudinary.
- **Likes and Comments**: Users can like/unlike posts and add comments to posts.
- **Notifications**: Users receive notifications when their posts are liked by others. Notifications can be fetched and marked as read.

## Tech Stack

- **Node.js**: JavaScript runtime used for building the backend.
- **Express.js**: Web framework used for handling routing and middleware.
- **MongoDB & Mongoose**: Database and ORM for storing and querying user data, posts, and notifications.
- **bcryptjs**: Used for hashing passwords.
- **Cloudinary**: Used for image upload and management.
- **JWT (JSON Web Tokens)**: Used for secure user authentication and session management.
- **Express-async-handler**: Middleware for handling asynchronous operations and errors in Express routes.
- **Mongoose**: Used for defining MongoDB schemas and querying the database.

## Getting Started

### Prerequisites

- Node.js and npm installed.
- MongoDB set up locally or with a service like MongoDB Atlas.
- Cloudinary account for handling image uploads.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/twitter-backend.git
   cd twitter-backend/server
   
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:
   ```bash
   MONGO_URI=your-mongodb-uri
   JWT_SECRET=your-jwt-secret
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

4. Start the server:
   ```bash
   npm start
   ```

   The server will start running on `http://localhost:5000`.

### API Endpoints

#### User Authentication

- **Sign Up**
  - **Endpoint**: `POST /api/auth/signup`
  - **Description**: Registers a new user.
  - **Request Body**:
    ```json
    {
      "fullName": "John Doe",
      "username": "johndoe",
      "email": "johndoe@example.com",
      "password": "yourpassword"
    }
    ```

- **Login**
  - **Endpoint**: `POST /api/auth/login`
  - **Description**: Authenticates a user and returns a token.
  - **Request Body**:
    ```json
    {
      "email": "johndoe@example.com",
      "password": "yourpassword"
    }
    ```

- **Logout**
  - **Endpoint**: `POST /api/auth/logout`
  - **Description**: Logs out the user by clearing the token.

- **Get Logged-in User**
  - **Endpoint**: `GET /api/auth/me`
  - **Description**: Retrieves the current logged-in user's details.
  - **Headers**: Authorization token required.

#### Posts

- **Create a Post**
  - **Endpoint**: `POST /api/posts`
  - **Description**: Creates a new post.
  - **Request Body**:
    ```json
    {
      "title": "My first post",
      "image": "base64ImageString"
    }
    ```

- **Delete a Post**
  - **Endpoint**: `DELETE /api/posts/:id`
  - **Description**: Deletes a post by ID.
  - **Headers**: Authorization token required.

- **Like/Unlike a Post**
  - **Endpoint**: `PUT /api/posts/:id/like`
  - **Description**: Likes or unlikes a post.
  - **Headers**: Authorization token required.

- **Comment on a Post**
  - **Endpoint**: `POST /api/posts/:id/comment`
  - **Description**: Adds a comment to a post.
  - **Request Body**:
    ```json
    {
      "text": "Great post!"
    }
    ```

- **Get All Posts**
  - **Endpoint**: `GET /api/posts`
  - **Description**: Fetches all posts, sorted by creation date.

#### Notifications

- **Get All Notifications**
  - **Endpoint**: `GET /api/notifications`
  - **Description**: Fetches all notifications for the logged-in user.

- **Delete All Notifications**
  - **Endpoint**: `DELETE /api/notifications`
  - **Description**: Deletes all notifications for the logged-in user.

## Error Handling

- The API responds with custom error messages and status codes when something goes wrong, ensuring clarity in case of invalid requests, authentication failures, etc.

## License

This project is licensed under the MIT License.

---
