# 🔗 URL Shortener

A simple and efficient URL Shortener built using **Node.js**, **Express**, and **MongoDB**. This application allows users to generate short URLs, redirect to original URLs, and track visit analytics.

------------------------------------------------------------

## 🚀 Features

* Generate short URLs from long URLs
* Redirect using short URLs
* Track visit history (timestamps)
* Get analytics (total clicks + visit details)
* Clean MVC architecture

------------------------------------------------------------

## 🏗️ Project Structure

```
URL_SHORTNER/
│
├── node_modules/
├── src/
│   ├── controllers/       # Business logic
│   ├── db/                # Database connection
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── app.js             # Express app config
│   ├── constants.js       # Constants (if any)
│   └── index.js           # Entry point
│
├── .env                   # Environment variables
├── .gitignore
├── package.json
└── README.md
```

------------------------------------------------------------

## ⚙️ Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **ID Generator:** shortid

------------------------------------------------------------

## 📦 Installation

1. Clone the repository:

```bash
git clone https://github.com/bishalProMax/URL_shortner.git
cd url_shortner
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
```

4. Start the server:

```bash
npm start
```

------------------------------------------------------------

## 🔌 API Endpoints

### 1️⃣ Generate Short URL

**POST** `/url/generate`

#### Request Body:

```json
{
  "url": "https://example.com"
}
```

#### Response:

```json
{
  "id": "shortId"
}
```

------------------------------------------------------------

### 2️⃣ Redirect to Original URL

**GET** `/url/redirect/:shortId`

➡️ Redirects to the original URL

------------------------------------------------------------

### 3️⃣ Get Analytics

**GET** `/url/analytics/:shortId`

#### Response:

```json
{
  "totalClicks": 5,
  "analytics": [
    {
      "timestamp": 1710000000000
    }
  ]
}
```

------------------------------------------------------------

## 🧠 How It Works

* A unique `shortId` is generated using **shortid**
* Original URL is stored in MongoDB
* Each redirect logs a timestamp in `visitHistory`
* Analytics endpoint returns click count + history

------------------------------------------------------------

## 🗄️ Database Schema

```js
{
  shortId: String,
  redirectURL: String,
  visitHistory: [
    {
      timestamp: Number
    }
  ]
}
```

------------------------------------------------------------

## 🛠️ Future Improvements

* Custom short URLs
* URL expiration
* Authentication (user-based URLs)
* Rate limiting
* UI frontend


