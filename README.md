[README-v5.10.txt](https://github.com/user-attachments/files/22066233/README-v5.10.txt)

Madpeset quick update v5.10 — 2025-08-31

What I changed:
1) Fixed duplicate query string on style.css in index.html, now "style.css?v=5.10".
2) Hero overlay text now sits lower on mobile, lighter background, subtle shadow for readability.
3) WhatsApp button (#submitBtn.btn.whatsapp) set to full width.
4) Safety bootstrap in script.js to call preloadDefaultModels(), renderModels(), enableGallerySelection() on DOMContentLoaded if not already present.

How to deploy:
- Replace your index.html, style.css, script.js with the versions from this ZIP.
- Keep your existing /data/models.json as-is. The site already fetches it at data/models.json.
- Hero image: keep "hero.jpg" in your project root. I used the file you sent.
- Commit to main on GitHub or create a branch and merge. Then hard refresh the site (or add ?v=5.10 to the URL).

Rollback:
- All changes are additive/minimal. Revert these three files to previous versions to roll back.
