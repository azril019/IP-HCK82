# API Documentation

Base URL: `https://iphck82-server.azriltdkso.fun`

## Endpoints

### Public Endpoints

#### GET /

> Hello World test endpoint

**Response**:

- Status Code: 200
- Body: "Hello World!"

#### POST /register

> Register a new user

**Request Body**:

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Response**:

- Status Code: 201
- Body:

```json
{
  "message": "User registered successfully",
  "access_token": "string"
}
```

**Error Responses**:

- 400: Bad Request (validation errors)
- 500: Internal Server Error

#### POST /login

> Login with email and password

**Request Body**:

```json
{
  "email": "string",
  "password": "string"
}
```

**Response**:

- Status Code: 200
- Body:

```json
{
  "access_token": "string"
}
```

**Error Responses**:

- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid credentials)
- 500: Internal Server Error

#### POST /google-login

> Login or register with Google

**Request Body**:

```json
{
  "googleToken": "string"
}
```

**Response**:

- Status Code: 200/201
- Body:

```json
{
  "message": "Success login with google",
  "access_token": "string"
}
```

**Error Responses**:

- 400: Bad Request ("Google token is required" or "Invalid google token")
- 500: Internal Server Error

### Protected Endpoints

The following endpoints require authentication. Include the access token in the request headers:

```
Authorization: Bearer <access_token>
```

#### GET /profile

> Get current user profile

**Response**:

- Status Code: 200
- Body:

```json
{
  "id": "integer",
  "name": "string",
  "email": "string",
  "provider": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

**Error Responses**:

- 401: Unauthorized (invalid or missing token)
- 500: Internal Server Error

#### DELETE /profile

> Delete current user profile

**Response**:

- Status Code: 200
- Body:

```json
{
  "message": "Profile deleted successfully"
}
```

**Error Responses**:

- 401: Unauthorized (invalid or missing token)
- 500: Internal Server Error

#### POST /preference

> Add a new preference

**Request Body**:

```json
{
  "key": "string",
  "value": "string"
}
```

**Response**:

- Status Code: 201
- Body:

```json
{
  "id": "integer",
  "key": "string",
  "value": "string",
  "userId": "integer",
  "createdAt": "date",
  "updatedAt": "date"
}
```

**Error Responses**:

- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid or missing token)
- 500: Internal Server Error

#### PUT /preference/:id

> Edit an existing preference

**Parameters**:

- id: Preference ID

**Request Body**:

```json
{
  "key": "string",
  "value": "string"
}
```

**Response**:

- Status Code: 200
- Body:

```json
{
  "id": "integer",
  "key": "string",
  "value": "string",
  "userId": "integer",
  "createdAt": "date",
  "updatedAt": "date"
}
```

**Error Responses**:

- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid or missing token)
- 404: Not Found (preference not found)
- 500: Internal Server Error

#### GET /preference

> Get all preferences for current user

**Response**:

- Status Code: 200
- Body:

```json
[
  {
    "id": "integer",
    "key": "string",
    "value": "string",
    "userId": "integer",
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

**Error Responses**:

- 401: Unauthorized (invalid or missing token)
- 500: Internal Server Error

#### DELETE /preference/:id

> Delete a preference

**Parameters**:

- id: Preference ID

**Response**:

- Status Code: 200
- Body:

```json
{
  "message": "Preference deleted successfully"
}
```

**Error Responses**:

- 401: Unauthorized (invalid or missing token)
- 404: Not Found (preference not found)
- 500: Internal Server Error

#### GET /recommendations

> Get recommendations from AI based on user preferences

**Response**:

- Status Code: 200
- Body:

```json
{
  "recommendations": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "type": "string"
    }
  ]
}
```

**Error Responses**:

- 401: Unauthorized (invalid or missing token)
- 500: Internal Server Error

#### GET /external-data/:id

> Get external data by ID

**Parameters**:

- id: External data ID

**Response**:

- Status Code: 200
- Body: (depends on external data structure)

**Error Responses**:

- 401: Unauthorized (invalid or missing token)
- 404: Not Found (data not found)
- 500: Internal Server Error
