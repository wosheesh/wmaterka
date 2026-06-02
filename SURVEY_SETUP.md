# Live Survey — setup guide

**"Where Are You on the Curve?"** — student responses are collected by a
**Google Form**, and visualised by a custom page on this site:
**`/survey-results.html`** (presenter screen, hosted on GitHub Pages).

```
Students → QR → Google Form → Google Sheet → survey-results.html (your dashboard)
```

GitHub Pages can't run a server or accept POSTs, so the *collection* is Google's
job and the *visualisation* is ours. You only ever edit one config block.

---

## Part A — Build the Google Form (~10 min)

1. Go to <https://forms.new>. Title it e.g. **"Where Are You on the Curve?"**
2. **Settings (gear icon) → Responses:**
   - Turn **OFF** "Collect email addresses".
   - Turn **OFF** "Limit to 1 response" (no Google sign-in required → truly anonymous).
   - Leave "Edit after submit" off.
3. Add a short description students will see, e.g.
   *"Anonymous. We never see individuals — only the room's average and spread. Skip any question you like."*
4. Add the **seven questions below, in this exact order**. Order matters because
   the dashboard also has a positional fallback. Wording can vary slightly — the
   dashboard matches on a keyword (in **bold** below) — but keep the keyword.

| # | Type in Forms | Question text (keyword the dashboard matches) | Options / scale |
|---|---|---|---|
| Q1 | **Linear scale** | "Picture a ladder… which **rung** are you standing on today?" | 0 to 10 (label 0 = "worst possible life", 10 = "best possible life") |
| Q2 | Multiple choice | "Do you expect your life to turn out better than your **parents**' lives?" | Much better / Somewhat better / About the same / Somewhat worse / Much worse |
| Q5 | Short answer | "In one word: what are you **still looking** for?" | (free text) |
| Q6 | Short answer | "What do you wish **older generations** understood about you?" | (free text) |
| Q7 | Multiple choice | "What **worries you most** about the world you're stepping into?" | Cost of living & housing / AI & the job market / Climate & the environment / Burnout & mental health / Political instability |

5. Make **every question NOT required** (duty of care — they must be able to skip).
6. For Q1 use **Linear scale** with min **0** and max **10**.

> Note on the live close: to re-poll Q1 on day 2 and compare day-1 vs day-2,
> the simplest is a **second copy of the Form** with just the ladder question
> (or add a "session: opening/closing" multiple-choice at the top of this form
> and filter in the dashboard later). Ask me and I'll wire the comparison in.

---

## Part B — Get the responses Sheet

1. In the Form, open the **Responses** tab → click the green **Sheets** icon →
   **Create new spreadsheet**. This sheet now fills up live as students submit.
2. Open that sheet. Its first row is the column headers (Timestamp + your 7 questions).

---

## Part C — Connect the Sheet to the dashboard

Pick **one** of the two data sources. **gviz** is near-instant; **csv** is
slightly delayed but the most bullet-proof across browsers. Try gviz first.

### Option 1 — gviz (live, recommended)

1. In the Sheet: **Share → General access → "Anyone with the link" → Viewer.**
   (This exposes only anonymous aggregate answers — no names, no emails.)
2. Copy the **Sheet ID** from the URL:
   `docs.google.com/spreadsheets/d/`**`THIS_LONG_ID`**`/edit#gid=`**`0`**
3. In **`survey-results.html`**, edit the `CONFIG` block:
   ```js
   source: 'gviz',
   sheetId: 'THIS_LONG_ID',
   gid: '0',           // the number after #gid= (the responses tab is usually 0)
   ```

### Option 2 — published CSV (most reliable, ~5 min cache)

1. In the Sheet: **File → Share → Publish to web.**
2. Choose the **responses sheet** + **Comma-separated values (.csv)** → **Publish.**
3. Copy the generated URL (looks like
   `https://docs.google.com/spreadsheets/d/e/…/pub?gid=0&single=true&output=csv`).
4. In `CONFIG`:
   ```js
   source: 'csv',
   csvUrl: 'PASTE_THE_PUBLISHED_CSV_URL',
   ```

> If gviz shows a CORS / "error" message in the top bar, switch to Option 2 —
> it always works, just refreshes every few minutes instead of instantly.

---

## Part D — Deploy & test

1. Commit and push `survey-results.html`. GitHub Pages rebuilds in ~1 min.
2. Open **`https://wmaterka.com/survey-results.html`** on your presenter laptop.
3. Submit one test response through the Form. Within your poll interval
   (default 15s, or ~5 min on CSV) the response count ticks up and the dot lands
   on the curve.

### The QR code for students
Point the QR at the **Form's** share link, **not** at the dashboard. For this form:

```
https://docs.google.com/forms/d/e/1FAIpQLSdj4b1ZVUYoBxUFpq7dCGC0FGgaog8kdmYIq9WySpRVDN36zw/viewform
```

Generate the QR with any tool, or drop the link into your slide deck's QR generator.
(Form → **Send → link icon → Shorten URL** gives a tidier `forms.gle/…` if you prefer.)

> **Already wired:** `survey-results.html` is configured for this session's sheet
> (`1g4-U3P-II9Gy7CZ_hnlKQf2SmkXXh8o5ooTdOU5Sq4U`, gid `1381412490`, gviz/live).
> Just confirm the sheet is shared "Anyone with the link → Viewer" and push.

---

## Using it live (matches your facilitation plan)

- All cards start **hidden** behind a hatched panel. The response counter is always
  visible (builds anticipation). Click **Reveal** on a card to show it on screen.
- **Opening (day 1):** reveal **Q1** (the dot on the curve) and **Q5** (word cloud).
  Hold back **Q6** for the close.
- **Closing (day 2):** reveal **Q6** and answer it from your side. If you re-polled
  Q1, compare the two dots.
- **Reveal all / Hide all** are in the top bar; **Auto-refresh** can be paused so the
  screen doesn't change mid-sentence.

## Tuning the curve shapes
The two reference curves are stylised. To match your research slide exactly, edit
`CURVE_OLD` (dotted U) and `CURVE_NEW` (solid rising) near the bottom of
`survey-results.html` — each is a list of `[age, value]` points.

## Privacy
- The Form collects no email and requires no login → responses are anonymous.
- The shared/published Sheet exposes only the anonymous answer rows.
- `survey-results.html` is `noindex` and reads data **only in the presenter's
  browser** — nothing is stored on this site.

## Want it fully self-hosted later?
If you ever want responses to land **as a JSON file in this repo** (no Google),
the path is a tiny Cloudflare Worker writing one JSON object per response.
Ask and I'll add it — but Google Forms is the faster route for a live room.
