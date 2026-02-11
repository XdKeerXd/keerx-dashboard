# Hosting KeerX Dashboard on GitHub Pages

This guide will show you how to put your Control Center on the internet for free using GitHub Pages.

## 🚀 Important Setup
Before you host on GitHub, you must have your C2 Server (`keerx_c2.py`) running with a **Public URL** (like Ngrok).

---

## Step 1: Create a GitHub Repository
1. Log in to your [GitHub account](https://github.com/).
2. Click **New** to create a new repository.
3. Name it something like `keerx-dashboard`.
4. Set it to **Public**.
5. Click **Create repository**.

## Step 2: Upload your Files
You only need the files inside the `web/` folder:
- `index.html`
- `style.css`
- `script.js`

1. Inside your new repository, click **uploading an existing file**.
2. Drag and drop the 3 files above.
3. Click **Commit changes**.

## Step 3: Enable GitHub Pages
1. Go to the **Settings** tab of your repository.
2. Click **Pages** on the left sidebar.
3. Under **Build and deployment** > **Branch**, select `main` (or `master`) and click **Save**.
4. GitHub will give you a link like `https://yourname.github.io/keerx-dashboard/`.

## Step 4: Configure the Dashboard
Once the website is live:
1. Open your new GitHub link in your browser.
2. Click the **⚙️ Gear Icon** in the top right.
3. Paste your **Ngrok URL** (e.g., `https://xyz.ngrok-video.app`).
4. Click OK.

---

## ⚠️ Common Problems
- **"Mixed Content" Error**: If your dashboard is `https` (GitHub) but your C2 is `http` (Ngrok), some browsers might block it. **Fix**: Use the `https://` version of your Ngrok URL.
- **PCs Not Showing**: Ensure your `keerx_pentest.py` is also using the **same** Ngrok URL as the dashboard.

> [!TIP]
> You can now access this dashboard from your phone or any other computer to check on your targets!
