# MiniCache

A lightweight, thread-safe in-memory cache built using Java and Spring Boot with LRU eviction, TTL-based expiration, REST APIs, and a web-based monitoring dashboard.

## 🚀 Features

- In-memory key-value storage
- LRU (Least Recently Used) cache eviction
- TTL (Time-To-Live) based expiration
- Thread-safe operations
- Cache hit and miss statistics
- Hit-rate calculation
- Add / Update cache entries
- Get cache entries
- Delete cache entries
- Clear entire cache
- REST API using Spring Boot
- Swagger/OpenAPI API documentation
- Interactive web dashboard
- Automatic statistics refresh
- Cache entries table
- Comprehensive JUnit tests

## 🛠️ Technologies Used

- Java 21
- Spring Boot
- Maven
- JUnit 5
- HTML5
- CSS3
- JavaScript
- REST API
- Swagger / OpenAPI
- Git & GitHub

## 🧠 Data Structures

MiniCache uses two main data structures:

### HashMap

Provides fast key-based lookup.

**Average time complexity:** O(1)

### Doubly Linked List

Maintains the order of recently used cache entries for LRU eviction.

**Insertion at front:** O(1)

**Removal from end:** O(1)

**Move to front:** O(1)

## ⚡ Cache Operations

| Operation | Description |
|---|---|
| SET | Add or update a cache entry |
| GET | Retrieve a value |
| DELETE | Remove a key |
| CLEAR | Remove all entries |
| TTL | Automatically expire entries |
| LRU | Remove least recently used entry when capacity is exceeded |

## 🌐 REST API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/cache/key/{key}` | Add or update an entry |
| GET | `/cache/key/{key}` | Get an entry |
| DELETE | `/cache/key/{key}` | Delete an entry |
| DELETE | `/cache` | Clear the cache |
| GET | `/cache/stats` | Get cache statistics |
| GET | `/cache/entries` | Get current cache entries |

## 📊 Dashboard

The web dashboard provides:

- Cache size
- Cache capacity
- Cache hits
- Cache misses
- Hit rate
- Add / Update functionality
- Get functionality
- Delete functionality
- Clear functionality
- Current cache entries table
- Automatic statistics refresh

## 🧪 Testing

The project includes JUnit tests covering:

- Basic cache operations
- Updating existing keys
- LRU eviction
- TTL expiration
- Delete operation
- Clear operation
- Cache statistics
- Invalid input handling
- Doubly linked list operations
- Thread-safety

## ▶️ How to Run

### 1. Clone the repository

```bash
git clone <your-github-repository-url>