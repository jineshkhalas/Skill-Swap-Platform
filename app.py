import os
import mysql.connector
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import bcrypt # For password hashing
import uuid # For generating UUIDs for user IDs
from flask_cors import CORS # For handling Cross-Origin Resource Sharing

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Database connection details from environment variables
DB_HOST = os.getenv('DB_HOST')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME')

def get_db_connection():
    """Establishes and returns a new database connection."""
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        # Check if the connection is successful
        if conn.is_connected():
            print(f"Successfully connected to MySQL database: {DB_NAME}")
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to MySQL: {err}")
        return None

@app.route('/')
def home():
    """Basic home route."""
    return "SkillSwap Backend is running!"

@app.route('/api/register', methods=['POST'])
def register():
    """Handles user registration."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password or not name:
        return jsonify({"message": "Email, password, and name are required"}), 400

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user_id = str(uuid.uuid4()) # Generate a unique ID for the user

    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Database connection failed"}), 500

    cursor = conn.cursor()
    try:
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"message": "User with this email already exists"}), 409

        # Insert new user into the database
        sql = "INSERT INTO users (id, email, password_hash, name) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (user_id, email, hashed_password, name))
        conn.commit()
        return jsonify({"message": "User registered successfully", "userId": user_id}), 201
    except mysql.connector.Error as err:
        print(f"Error during registration: {err}")
        conn.rollback() # Rollback changes if an error occurs
        return jsonify({"message": "Registration failed", "error": str(err)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    """Handles user login."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True) # Return rows as dictionaries
    try:
        cursor.execute("SELECT id, email, password_hash, name, is_admin FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            # Password matches, login successful
            return jsonify({
                "message": "Login successful",
                "userId": user['id'],
                "email": user['email'],
                "name": user['name'],
                "isAdmin": user['is_admin']
            }), 200
        else:
            return jsonify({"message": "Invalid credentials"}), 401
    except mysql.connector.Error as err:
        print(f"Error during login: {err}")
        return jsonify({"message": "Login failed", "error": str(err)}), 500
    finally:
        cursor.close()
        conn.close()

# Example route to get all users (for testing/admin purposes)
@app.route('/api/users', methods=['GET'])
def get_users():
    """Retrieves all users from the database."""
    conn = get_db_connection()
    if conn is None:
        return jsonify({"message": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, email, name, location, availability, is_public, is_admin, status FROM users")
        users = cursor.fetchall()
        return jsonify(users), 200
    except mysql.connector.Error as err:
        print(f"Error fetching users: {err}")
        return jsonify({"message": "Failed to retrieve users", "error": str(err)}), 500
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    app.run(debug=True, port=5000) # Run on port 5000 for backend
