# MiniCache
MiniCache is a high-performance in-memory key-value store built with Java and Spring Boot. It provides fast data access with LRU eviction, TTL-based expiration, cache statistics, REST APIs, and a web dashboard.
## Features

- In-memory key-value storage
- Fast data access using HashMap
- LRU cache eviction using Doubly Linked List
- TTL-based key expiration
- Min-Heap-based expiration management
- Cache hit and miss statistics
- REST APIs for cache operations
- Swagger/OpenAPI API documentation
- Web-based cache dashboard
- Automatic dashboard refresh
- User authentication with JWT
- Refresh token support
- Email verification
- Forgot-password and password-reset functionality
- PostgreSQL database integration
## Technology Stack

- **Language:** Java 21
- **Framework:** Spring Boot 3.5.5
- **Build Tool:** Maven
- **Database:** PostgreSQL
- **ORM:** Spring Data JPA / Hibernate
- **Security:** Spring Security + JWT
- **API Documentation:** Swagger / OpenAPI
- **Email Service:** EmailJS
- **Frontend:** HTML, CSS, JavaScript
## Core Architecture

MiniCache uses the following data structures and algorithms:

- **HashMap:** Provides O(1) average-time key lookup.
- **Doubly Linked List:** Maintains the LRU order and supports O(1) insertion and removal.
- **Min-Heap:** Manages TTL-based expiration efficiently.
- **Cache Statistics:** Tracks cache hits and cache misses.
## API Endpoints

MiniCache provides REST APIs for cache management and user authentication.

### Cache APIs

- `POST /cache/key/{key}` — Store or update a cache value
- `GET /cache/key/{key}` — Retrieve a cache value
- `DELETE /cache/key/{key}` — Delete a cache entry
- `GET /cache/entries` — View cache entries
- `GET /cache/stats` — View cache statistics

### Authentication APIs

- `POST /auth/register` — Register a new user
- `POST /auth/login` — Authenticate a user
- `POST /auth/refresh` — Generate a new access token using a refresh token
- `POST /auth/forgot-password` — Request password reset
- `POST /auth/reset-password` — Reset password
- `GET /auth/verify-email` — Verify email address

API documentation is available through **Swagger/OpenAPI**.
## Project Structure

```text
MiniCache/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── minicache/
│   │   │           ├── controller/
│   │   │           ├── service/
│   │   │           ├── repository/
│   │   │           ├── model/
│   │   │           └── MiniCacheApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── frontend/
├── pom.xml
├── README.md
└── .gitignore
```
 ## Installation

### 1. Clone the repository

```bash
git clone https://github.com/cheedellasravani07-max/MiniCache.git
cd MiniCache
```

### 2. Configure PostgreSQL
Create a PostgreSQL database and configure the database connection using the required environment variables.
```text
src/main/resources/application.properties
```

### 3. Build the project

```bash
mvn clean install
```
### 4. Run the application

```bash
mvn spring-boot:run
```

The application will start on:
http://localhost:8080
## Configuration

Before running MiniCache, configure the required environment variables for:

- PostgreSQL database connection
- JWT authentication
- EmailJS email service
- Application configuration

For security, **do not commit passwords, API keys, JWT secrets, or other sensitive credentials to GitHub**.

Use environment variables for sensitive configuration values.
## Usage

Once the application is running, you can:

1. Register and verify a user account.
2. Log in using the registered credentials.
3. Access the MiniCache dashboard.
4. Add key-value pairs to the cache.
5. Retrieve and delete cached values.
6. Configure TTL for automatic expiration.
7. Monitor cache size, capacity, hits, and misses.
8. Explore and test APIs through Swagger/OpenAPI.
## Testing

The project includes automated tests for the application's core functionality.

Run the tests using:

```bash
mvn test
```
To build the complete project and run the tests:
```bash
mvn clean install
```
All tests should pass before deploying the application.

## Deployment

MiniCache is deployed using Render.

The deployed application is available at:

https://minicache-api.onrender.com

The application uses environment variables on the deployment platform for sensitive configuration such as database credentials, JWT secrets, and EmailJS credentials.
## Performance

MiniCache is designed for efficient cache operations using appropriate data structures:

| Operation | Data Structure | Average Complexity |
|---|---|---:|
| Key lookup | HashMap | O(1) |
| Key insertion | HashMap | O(1) |
| LRU update | Doubly Linked List | O(1) |
| LRU eviction | HashMap + Doubly Linked List | O(1) |
| TTL insertion | Min-Heap | O(log n) |
| TTL expiration removal | Min-Heap | O(log n) |

These data structures help MiniCache provide fast cache access while efficiently managing memory and expired entries.
## Security

MiniCache includes authentication and security features such as:

- JWT-based authentication
- Access and refresh tokens
- Password hashing using Spring Security
- Email verification
- Forgot-password and password-reset functionality
- Protected application endpoints
- Environment variables for sensitive credentials

Sensitive information such as passwords, API keys, database credentials, and JWT secrets should never be committed to the repository.
## Future Enhancements

Potential improvements for future versions include:

- Distributed caching support
- Redis-compatible commands
- Advanced cache monitoring and analytics
- Improved concurrency and scalability
- Docker containerization
- Cloud-based database and cache integration
## Project Purpose

This project is developed for educational and portfolio purposes.
## Author

**Sravani Cheedella**

B.Tech Information Technology Student  
Interested in Java, Data Structures & Algorithms, Backend Development, and Software Engineering.