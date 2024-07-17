
# MERN Starter Template

This is a starter template for a MERN stack application. It includes user authentication with JWT and Google OAuth, a responsive design, and a comprehensive development setup.

## Features

- **MERN Stack**: MongoDB, Express, React, Node.js
- **User Authentication**: Email/Password login and Google OAuth
- **Responsive Design**: Responsive and modern UI
- **Development Setup**: Scripts for development and production environments
- **Environment Variables**: Easy management of environment variables

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- Git

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/MERN-StarterTemplate.git
   ```

2. **Install dependencies:**

   Navigate to the server and client directories and install the dependencies:

   ```bash
   cd MERN-StarterTemplate/server
   npm install

   cd ../client
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the `server` directory and add your environment variables:

   ```plaintext
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongo_uri
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

### Running the Application

1. **Start the server:**

   Navigate to the `server` directory and run the development script:

   ```bash
   cd server
   npm run dev
   ```

2. **Start the client:**

   Navigate to the `client` directory and start the React application:

   ```bash
   cd client
   npm start
   ```

### File Structure

```
mern-auth-app/
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
├── .gitignore
├── README.md
```

### Contributing

Feel free to fork this repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Final Steps

1. **Create the README file:**

   ```bash
   touch README.md
   ```

2. **Add the README content:**

   Copy the provided content into the `README.md` file.

3. **Commit the README:**

   ```bash
   git add README.md
   git commit -m "Add README with project details and setup instructions"
   git push origin main
   ```

