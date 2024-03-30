# Collaborative Document Editor

## Introduction

Collaborative Document Editor is a web-based application that allows multiple users to simultaneously edit a document in real-time. It provides a seamless collaborative experience, enabling users to work together on documents, see changes in real-time, and communicate with each other within the application.

## Features

- Real-time collaboration: Multiple users can edit the same document simultaneously, with changes instantly visible to all participants.
- User authentication: Users can create accounts, log in, and access their documents securely.
- Document management: Users can create, edit, save, and delete documents.
- Chat functionality: Integrated chat feature allows users to communicate with each other while collaborating on documents.
- Version history: Keeps track of document revisions, allowing users to revert to previous versions if needed.
- Rich text editing: Supports various text formatting options such as bold, italic, underline, and more.
- Cross-platform compatibility: Accessible on desktop, tablet, and mobile devices.

## Technologies Used

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (Vue.js or React)
  - WebSocket (Socket.io)

- Backend:
  - Node.js
  - Express.js
  - MongoDB (or other database for storing documents and user data)
  - JWT (JSON Web Tokens) for authentication
  - Socket.io for real-time communication

## Setup Instructions

1. Clone the repository: `git clone <repository_url>`
2. Navigate to the project directory: `cd collaborative-document-editor`
3. Install dependencies: `npm install`
4. Set up environment variables as described in the README.
5. Run the server: `npm start`
6. Access the application in your web browser at the specified `BASE_URL`.

## Server Side (Backend)

### Environment Variables

Before running the server, make sure to define the following environment variables:

- `S_PORT`: Socket.io port
- `PORT`: Express port
- `DATABASE_URL`: MongoDB URI
- `BASE_URL`: Website URL
- `EMAIL`: Email for sending emails
- `EMAIL_PASS`: Password for email sending
- `TOKEN_SECRET`: Secret key for JWT token generation

## Contributing

Contributions are welcome! If you'd like to contribute to the project, please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request detailing your changes.

## License

This project is licensed under the [MIT License](LICENSE).
