# Madpeset (Remote 3D Printing)

A static website for ordering custom 3D printing.  
Users can choose from existing models or upload a description/image, select color, size, and hardness, get a live price calculation, and send their order directly via WhatsApp.

---

## 📂 Project Structure

- **index.html** – Main page with the 8-step order wizard.  
- **style.css** – Responsive design and mobile adjustments.  
- **script.js** – Core logic: model selection, pricing, WhatsApp integration, texts loader.  
- **admin.html + admin.js** – Admin interface to add, edit, delete models (saved to `localStorage` or exported to `models.json`).  
- **models-order.html + models-order.js** – Drag-and-drop tool for reordering models.  
- **text-admin.html + text-admin.js** – Admin interface for editing all texts and exporting `texts.json`.  
- **data/models.json** – List of models used by the site (title, description, price, image).  
- **data/texts.json** – All fixed texts used on the site (headings, placeholders, messages, CTA).  
- **hero.jpg** – Hero image on the homepage (can also be updated from the admin).  
- **favicons** – Multiple sizes for browser/device compatibility.

---

## 🚀 Running Locally

1. Clone or download the repo.  
2. Open `index.html` directly in a browser (no server required).  
3. To test admin tools:  
   - Open `admin.html` to manage models.  
   - Open `text-admin.html` to edit site texts.  
   - Open `models-order.html` to reorder models.

---

## 🛠 Content Updates

- **Models**  
  Use `admin.html` → export `models.json` → replace the file in `data/` → push to GitHub.  

- **Texts**  
  Use `text-admin.html` → export `texts.json` → replace the file in `data/` → push to GitHub.  

- **Hero Image**  
  Can be updated from `admin.html`.  
  To set a new default for all users, replace `hero.jpg` in the project directly.

---

## 📱 Features

- 8-step guided order wizard.  
- Choose existing model or create a new one.  
- Dynamic price calculation (size, hardness, resolution).  
- One-click WhatsApp order submission.  
- Easy content and model management via admin tools.  
- Fully mobile-friendly.

---

## 📝 Current Version
Stored in `texts.json` under `"version"`.  
Example: `גרסה 6.601`.

---

## 📄 License
Private project for **maayan3b.art** – not for redistribution without permission.
