# 🛒 AI Product Curator(S-Mart+) - Walmart Hackathon Project

A smart, interactive shopping experience that combines AI-driven curation, real-time recommendations, voice interaction, and AR product previews to bring the best of physical and online shopping into one seamless platform.

---

## 🚀 Features

* 🎯 **AI-Powered Product Curation**
  Get personalized product bundles using voice/text prompts powered by Groq Cloud AI.

* 🛍️ **Smart Recommendations**
  Context-aware suggestions based on category, occasion, or user preference.

* 🗣️ **Omni-dimensional Voice Assistant**
  Natural, conversational interface that mimics a human shopping assistant.

* 🛒 **AI Bucket**
  A dynamic cart powered by intent-based additions.

* 🧾 **Product Inquiry with Phone Number**
  Contact for more info before buying.

* 🪑 **Augmented Reality (AR) Tryouts**
  Visualize furniture in your real environment using your device camera.

---

## 🧑‍💻 Tech Stack

### 🔹 Frontend

* **ReactJS**
* **TailwindCSS**
* `@google/model-viewer` – for rendering AR models (GLB/USDZ)

### 🔹 Backend

* **Python** – AI agent logic and recommendation handling
* **Express.js** – API layer and routing

### 🔹 AI Integration

* **Omni-dimensional Voice Agent** – powered by **Groq Cloud**
* Real-time contextual suggestions, speech-to-intent conversion, and product reasoning

### 🔹 AR Integration

* `tensorflow.js` + `ar.js` modules
* AR-ready GLB/USDZ models rendered with `<model-viewer>`

### 🔹 Database

* **MongoDB** – for storing:

  * Product data
  * User preferences
  * Cart & order history

---

## 🗄️ Screenshots

### 🔍 AI Product Curation Page

![WhatsApp Image 2025-07-14 at 23 33 09_7d338461](https://github.com/user-attachments/assets/bf5e7b26-f25e-4a54-b3be-81d2bd311169)


---

### 🛒 Product Listing with Inquiry

![WhatsApp Image 2025-07-14 at 23 33 09_bd4afd33](https://github.com/user-attachments/assets/1700b7cf-ffd6-427a-9c9a-e5acb8272593)


---

### 🪄 AR Furniture Tryout

![WhatsApp Image 2025-07-14 at 23 34 37_f064a81b](https://github.com/user-attachments/assets/13816ab7-69e1-42a6-ac33-9e7254154ef9)


---

## 🌐 Deployment

* **Frontend**: [Vercel](https://vercel.com/)
* **Backend**: [Render](https://render.com/)

---

## 📁 Repository Structure

```
/client     → Frontend React code (UI, routes, model-viewer)
/server     → Express routes, AI interaction handlers
/ai         → Python logic for recommendation engine
/models     → GLB/USDZ files for AR
/public     → Static assets
```

---

## 👥 Team BotZon

* **Ritam Vaskar**
* **Rudrika Panigrahi**
* **Shreyash Singh**

---
