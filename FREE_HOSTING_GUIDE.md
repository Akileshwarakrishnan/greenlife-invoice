# GreenLife Natural Foods — 100% Free Hosting Guide (முழு இலவச ஹோஸ்டிங் வழிகாட்டி)

This complete guide will help you host your entire **GreenLife Natural Foods** application on the internet **completely free of cost ($0 / ₹0 forever)**.

---

## Architecture Overview

| Component | Free Platform | Free Plan Limits | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** (React + Vite + Tailwind) | **Vercel** ([vercel.com](https://vercel.com)) | 100GB Bandwidth / month, Unlimited builds, Free SSL Certificate, Custom Domain support | Serves the web UI globally with fast CDN |
| **Backend** (FastAPI + Python + Database) | **Render** ([render.com](https://render.com)) | 750 free compute hours / month (covers 24/7 full month) | Serves REST APIs, PDF bill generator, WhatsApp parser |

---

## Step 1: Push Your Code to GitHub

If you haven't already pushed your code to GitHub:

1. Open your terminal in `invoice` folder:
   ```bash
   git init
   git add .
   git commit -m "feat: complete greenlife natural foods invoice system"
   ```
2. Go to [github.com](https://github.com) and click **New Repository**.
3. Name it: `greenlife-invoice` (Public or Private).
4. Run the commands shown by GitHub to push:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/greenlife-invoice.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Deploy Backend to Render (100% Free)

1. Sign up / Log in to [render.com](https://render.com) using your GitHub account.
2. Click **New +** $\to$ **Web Service**.
3. Select your repository `greenlife-invoice`.
4. Configure the service settings:
   - **Name**: `greenlife-backend` (or any unique name)
   - **Region**: `Singapore` (closest & fastest for India)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: **Free** ($0 / month)
5. Under **Environment Variables**, add:
   - `ENVIRONMENT` = `production`
   - `DATABASE_URL` = `sqlite:///./greenlife.db`
   - `JWT_SECRET` = (Click *Generate* or type any random secret string)
6. Click **Deploy Web Service**.
7. Wait 2–3 minutes for the build to finish. Once live, Render will give you a public URL, for example:
   👉 **`https://greenlife-backend.onrender.com`**

> **Note on Render Free Tier**: Free web services sleep after 15 minutes of inactivity. The first request takes ~30 seconds to spin up, and then it is lightning fast.

---

## Step 3: Deploy Frontend to Vercel (100% Free)

1. Sign up / Log in to [vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New...** $\to$ **Project**.
3. Select your `greenlife-invoice` repository and click **Import**.
4. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `dist` (default)
5. Expand **Environment Variables** and add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://greenlife-backend.onrender.com/api` *(replace with your actual Render URL from Step 2)*
6. Click **Deploy**!
7. Within 1 minute, Vercel will give you your live web application link:
   👉 **`https://greenlife-invoice.vercel.app`**

---

## Step 4: Add Backend CORS Permission

Once you have your Vercel URL (e.g. `https://greenlife-invoice.vercel.app`), let Render know it is allowed:
1. In [Render Dashboard](https://dashboard.render.com), open `greenlife-backend`.
2. Go to **Environment**.
3. Note: Our backend `app/main.py` already includes `allow_origins=["*"]` by default, so it connects immediately out of the box!

---

## Step 5: Test Your Live App

1. Open your Vercel link on your laptop, iPad, or mobile phone:
   `https://greenlife-invoice.vercel.app`
2. Log in with the pre-seeded credentials:
   - **Email**: `admin@greenlife.com`
   - **Password**: `admin123`
3. Test creating an invoice:
   - Go to **புதிய பில் (New Bill)**.
   - Choose customer and tap items.
   - Select **பாதி பணம் (Partially Paid)** $\to$ enter amount paid.
   - Click **பில் உருவாக்கு (Create Bill)**.
   - Download the official cash/credit bill PDF!
4. Test Dark/Light Theme:
   - Tap the **Sun / Moon** toggle in the top navigation bar.

---

## Optional: Store WiFi / Local Offline Access (Zero Internet)

If the 55-year-old shop owner wants to run the system directly on the store computer without any internet connection:

1. Connect both the store computer and the mobile/tablet to the **same shop WiFi**.
2. Run Vite on the computer:
   ```bash
   npm run dev -- --host 0.0.0.0 --port 5173
   ```
3. Look at the terminal output:
   ```
   ➜ Network: http://192.168.1.9:5173/
   ```
4. Open `http://192.168.1.9:5173/` on the shop phone or tablet. You can immediately create bills from your mobile while walking around the store!
