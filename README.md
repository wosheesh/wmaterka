# Personal Website

A personal website for Wojtek Materka, designed to be hosted on GitHub Pages.

## Structure

- `index.html` - Homepage
- `teaching.html` - Teaching & Workshops page
- `speakingwriting.html` - Speaking & Writing page
- `about.html` - CV/About page
- `css/style.css` - Main stylesheet
- `js/` - JavaScript directory (for future enhancements)

## Setup for GitHub Pages

### Initial Setup

1. **Create a GitHub repository**
   - Create a new repository on GitHub (e.g., `wmaterka.github.io` or your chosen repository name)

2. **Push your files**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click on **Settings**
   - Scroll down to **Pages** in the left sidebar
   - Under **Source**, select **Deploy from a branch**
   - Choose **main** branch and **/ (root)** folder
   - Click **Save**

4. **Access your site**
   - Your site will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
   - If your repository is named `YOUR_USERNAME.github.io`, it will be available at: `https://YOUR_USERNAME.github.io/`
   - It may take a few minutes for the site to be available after first deployment

### Updating Your Site

Simply push changes to the `main` branch:

```bash
git add .
git commit -m "Update website"
git push
```

GitHub Pages will automatically rebuild and deploy your site.

## Custom Domain (Optional)

If you want to use a custom domain (e.g., `www.wmaterka.com`):

1. Add a `CNAME` file to the root of your repository with your domain name:
   ```
   www.wmaterka.com
   ```

2. Configure DNS settings with your domain provider:
   - Add a CNAME record pointing `www` to `YOUR_USERNAME.github.io`
   - Or add an A record pointing to GitHub Pages IP addresses

3. In GitHub repository Settings > Pages, add your custom domain

## Notes

- The CV PDF link in `about.html` currently points to `/s/Wojtek-Materka-CV-05_2025.pdf`. You'll need to add this file to your repository in an `s/` directory, or update the link to point to the correct location.
- All external links (LinkedIn, articles, etc.) are preserved from the original site.
- The site uses Inter font from Google Fonts as a free alternative to Aktiv Grotesk.
- The site is fully responsive and works on mobile, tablet, and desktop devices.

## Local Development

To preview the site locally:

1. Simply open `index.html` in your web browser, or
2. Use a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (with http-server)
   npx http-server
   ```
   Then visit `http://localhost:8000` in your browser.

