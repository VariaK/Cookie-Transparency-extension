# 🍪 Cookie Transparency Extension with AI Insight (🛠️ Work-In-Progress...)

## A Chrome extension powered by **Amazon Bedrock** and **AWS Lambda** that demystifies cookies used by websites—bringing **transparency**, **privacy awareness**, and **AI-generated explanations** to the modern web.

## 📦 Features

- 🔍 Detects and lists cookies set by visited websites
- 🧠 Uses Claude (via Amazon Bedrock) to generate human-readable explanations
- 📊 Categorizes cookies into Analytics, Advertising, Essential, and more
- ⚠️ Assigns a privacy risk score (Low / Medium / High)
- 🌍 Lightweight and fast, designed for global use across privacy regulations (GDPR, etc.)

---

## 🚀 Technologies Used

| Tech              | Purpose                                       |
| ----------------- | --------------------------------------------- |
| 🧠 Amazon Bedrock | Claude 3 Sonnet model for cookie explanations |
| 🔧 AWS Lambda     | Backend logic for classification & caching    |
| 📊 DynamoDB       | Stores previously analyzed cookies            |
| 🌐 API Gateway    | Serverless API endpoint                       |
| 🧩 Chrome APIs    | Captures cookie data from web requests        |
| 📝 JavaScript     | Handles extension logic and UI interactions   |

---

## 🧪 How It Works

1. 🕵️‍♀️ Extension listens to cookie events on visited sites
2. 📡 Sends cookie name & domain to AWS Lambda via API Gateway
3. 💬 Lambda:
   - Checks DynamoDB cache
   - If not found, prompts Claude (via Bedrock) for explanation
   - Stores and returns the result
4. 📊 Extension shows explanation, category, and risk score in the popup

---
