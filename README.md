# Personal Website - Jekyll

A personal website for Wojtek Materka, built with Jekyll and hosted on GitHub Pages.

## Structure

- `index.md` - Homepage
- `leadership.md` - Leadership Development page
- `speaking.md` - Speaking page
- `writing.md` - Writing page
- `about.md` - About/CV page
- `_layouts/default.html` - Base Jekyll layout
- `_includes/header.html` - Site header with navigation
- `_includes/footer.html` - Site footer
- `css/style.css` - Main stylesheet
- `js/main.js` - JavaScript file (for future enhancements)
- `_config.yml` - Jekyll configuration

## Setup for GitHub Pages

### Initial Setup

1. **Push your files to GitHub**
   ```bash
   git add .
   git commit -m "Migrate to Jekyll"
   git push
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click on **Settings**
   - Scroll down to **Pages** in the left sidebar
   - Under **Source**, select **Deploy from a branch**
   - Choose **main** branch and **/ (root)** folder
   - Click **Save**

3. **Access your site**
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

GitHub Pages will automatically rebuild and deploy your site using Jekyll.

## Custom Domain

The site uses a custom domain (`wmaterka.com`) configured via the `CNAME` file. This is automatically handled by GitHub Pages.

## Local Development

To preview the site locally with Jekyll:

1. **Install Jekyll** (if not already installed):
   ```bash
   gem install bundler jekyll
   ```

2. **Install dependencies** (if using a Gemfile):
   ```bash
   bundle install
   ```

3. **Serve the site locally**:
   ```bash
   bundle exec jekyll serve
   # or simply:
   jekyll serve
   ```

4. **View the site**:
   - Open your browser and visit `http://localhost:4000`
   - The site will automatically reload when you make changes

## Jekyll Structure

- **Pages**: All content pages are in Markdown (`.md`) format with YAML front matter
- **Layouts**: The `_layouts/default.html` file contains the base HTML structure
- **Includes**: Reusable components (header, footer) are in the `_includes/` directory
- **Configuration**: Site settings are in `_config.yml`

## Notes

- The CV PDF link in `about.md` points to `/s/Wojtek-Materka-CV-05_2025.pdf`. Ensure this file exists in your repository.
- All external links (LinkedIn, articles, etc.) are preserved.
- The site uses Inter font from Google Fonts.
- The site is fully responsive and works on mobile, tablet, and desktop devices.
- Active navigation links are handled by Jekyll Liquid templating in `_includes/header.html`.

## Migration Notes

This site was migrated from static HTML to Jekyll. The old HTML files (`index.html`, `teaching.html`, etc.) can be removed after verifying the Jekyll site works correctly.
