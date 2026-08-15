# Zhuoran Li — Research Portfolio

A dependency-free static portfolio prepared for GitHub Pages. The site uses semantic HTML, CSS, and a small amount of JavaScript; no build step is required.

Before publishing, complete the private checklist stored next to this directory, especially the reserved paper figures and CV privacy/attribution review. It is intentionally excluded from the deployable source.

## Preview locally

From this directory, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Replace the reserved paper visuals

The following projects currently contain a deliberate `Visual forthcoming` block:

- ManiLadder
- GKD-Recruiter
- DRNCS
- Shortest Path Tour

When a publication-ready image is available, put it in `assets/media/`, replace the corresponding `<figure class="project-visual project-placeholder">…</figure>` block in `index.html` with an `<img>`, and keep the existing `project-visual` class. Use a descriptive `alt` attribute and preferably a 4:3 or 16:10 crop.

Example:

```html
<figure class="project-visual">
  <img src="assets/media/drncs-cover.webp" alt="Road-network contraction and shortcut graph used by DRNCS" width="1600" height="1000" loading="lazy">
</figure>
```

## Public identity and project links

- Personal GitHub: `https://github.com/iairplane`
- RoboHarness uses the collaboration project's canonical repository at `https://github.com/LZY-1021/RoboHarness`; this is intentionally separate from the personal GitHub profile.
- Downloadable CV: `documents/Zhuoran_Li_CV.pdf`

## Deploy

Create the GitHub repository `iairplane/iairplane.github.io`, copy this directory to it, and enable GitHub Pages from the repository root. No external deployment has been performed by this workspace task.
