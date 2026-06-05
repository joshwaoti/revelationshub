# RevelationsHub — Pricing Research & Recommended Pricing Model

> Comprehensive competitor pricing research and the recommended pricing model for RevelationsHub.
> Compiled from public pricing pages and third-party reviews of direct and adjacent competitors, audited against the existing codebase (`subscriptions.ts`, `schema.ts`, `pricing/page.tsx`).

---

## 1. What RevelationsHub is

**RevelationsHub** is a "Ministry Operating System" SaaS for **churches and faith-based organizations** that:

- Converts long sermons (and podcasts) into short-form vertical clips for TikTok / Reels / Shorts
- Auto-detects "viral moments" with Gemini 2.5 Pro
- Transcribes with **WhisperX**, reframes with active-speaker detection (**LR-ASD**)
- Generates **discipleship content**: discussion guides, devotionals, sermon outlines, blog posts, summaries, image quotes, social carousels
- Has a "Divine Harmony" design system (Amethyst + Pacific Blue + Cotton Candy)
- **Stack**: Next.js 16 · Clerk · Convex · Inngest · Modal GPU · FastAPI · S3 · **Paystack** (African payment rail)
- Existing PRD pricing (copied from SermonShots): Free → Plus $49.99 → Silver $67 → Gold $97 → Platinum $195
- Database uses `clipCredits` + `clipsUsed` → credit-based monthly allowance model

The Paystack choice is a strong signal that **African / global-South churches are a primary market**, not just US churches.

---

## 2. Competitor landscape

### A. Direct church-specific competitors

| Tool | Free | Entry | Mid (sweet spot) | Pro | Enterprise | Billing unit | Annual discount |
|---|---|---|---|---|---|---|---|
| **SermonShots** (primary) | 2 clips, watermarked | **Plus $39.99/mo** (ann) / $49.99 (mo) | **Silver $57 / $67** — *mo* | Gold $87 / $97 | Platinum $171 / $195 | "10 hrs of upload/mo" + clip counts | ~20% |
| **Pulpit AI** (Subsplash) | Trial | **Basic $39/mo** (5 sermons) | **Standard $59/mo** (10 sermons) — "most popular" | Pro $129/mo (25 sermons) | Custom | Sermon uploads | ~10% |
| **SermonSpark** | 500 credits | **$7.95/mo** (3,000 credits) | — | — | — | Credits | — |
| **VerseVision** (Nigeria) | — | ₦15,000 (~$10) | ₦45,000 (~$30) | ₦122,450 (~$82) | Custom | Hours of transcription + cameras | — |
| **ChurchCMS** (Kenya) | Free (MIT, open source) | $29/mo managed | — | $99 one-time install | — | M-Pesa giving included | — |
| **FaithFlow** (Nigeria) | — | Custom | — | — | — | Cloud-based admin | — |
| **Churchplus** (Nigeria) | — | ₦120,000/yr (~$80) | ₦250,000/yr | ₦400,000/yr | — | Web + giving | — |
| **Sermon Sling** (done-for-you) | 7-day trial | — | — | — | **$550/mo** | Per-church human service | — |

### B. General AI video clippers (likely alternates for budget churches)

| Tool | Free | Entry | Mid | Pro | Enterprise | Billing unit |
|---|---|---|---|---|---|---|
| **Opus Clip** | 60 min, watermarked | Starter **$15/mo** (150 min) | **Pro $14.50/mo ann** / $29 (300 min) | — | Business custom | 1 credit = 1 min input |
| **Vizard.ai** | 60 min, 720p, watermark | **Creator $14.50/mo ann** / $29 (600 min) | Business $19.50 / $39 | — | Enterprise custom (10k+ min) | 1 credit = 1 min |
| **Vidyo.ai / quso.ai** | 75 credits, 720p, watermark | **Lite $19/mo** (~$12 ann) | **Essential $35/mo** (~$18 ann) | Growth $49 (~$25 ann) | Custom | Credits |
| **Munch** | Sample projects only (no upload) | Solopreneur $9 / Creator $19–49 | Small Business $49–99 | Agency $299 | — | Munches / upload minutes |
| **Choppity** | 1 hr, watermark | **Starter $7.50/mo ann** / $15 (3 hrs) | **Pro $14/mo ann** / $28 (5 hrs) | — | Custom | Hours of upload |
| **Submagic** | 3 videos/mo, watermark | **Starter $12/mo ann** / $19 (15 vids × 2 min) | **Pro $23/mo ann** / $39 (40 × 5 min) | Business $41 ann / $69 (100 × 30 min) | Custom | Videos × length; **+$12 Magic Clips add-on** |
| **Klap** | Limited | $29/mo | — | — | — | URL-based |
| **Descript** | 1 hr, watermark | **Hobbyist $16/mo ann** / $24 | **Creator $24/mo ann** / $35 (30 hrs) | Business $50 ann / $65 | Custom | Media hours + AI credits |
| **Castmagic** | Limited | **Hobby $19/mo ann** / $29 (300 min) | **Starter $39/mo ann** / $59 (800 min) | Rising Star $179 / $299 | Custom | Minutes of audio |
| **Capsho** | Trial | Podcaster $29/mo (4 ep) | Pro $79/mo (12 ep) | $99/mo | Custom | Episodes |
| **Headliner** | Free tier | $19.99/mo (Pro) | — | — | — | — |
| **Riverside** | Limited | $15/mo | $24–$79/mo | Business custom | — | Recording + clips |

### C. Sources

- SermonShots: sermonshots.com/pricing · support.sermonshots.com · goodmessages.online review
- Pulpit AI: pulpitai.com/pricing · subsplash.com/product/pulpit-ai · findskill.ai comparison
- Opus Clip: opus.pro/pricing · help.opus.pro · eesel.ai · ssemble.com · checkthat.ai
- Vizard: vizard.ai/pricing · docs.vizard.ai · softwarefinder.com · plisio.net review
- Vidyo.ai: powerusers.ai · creatorstackclub.com · oreateai.com · aireviewguys.com
- Munch: munch.video/pricing · creatorstackclub.com · bestreviews.net · saasworthy.com
- Choppity: choppity.com/pricing · similarlabs.com · choppity.com/alternatives
- Submagic: submagic.co/pricing · droneandcam.com · triedbyhumans.com · clips.forkoff.xyz
- Descript: descript.com/pricing · eesel.ai · meetjamie.ai · aibrainjet.com
- Castmagic: castmagic.io/pricing · toolchase.com · toolcritic.co · dupple.com
- SermonSpark: sermonspark.ai · findskill.ai · jotform.com
- VerseVision, ChurchCMS, Churchplus, FaithFlow, Subsplash, Sermon Sling, Capsho, Klap, Headliner, Riverside: respective pricing pages and third-party reviews
- African-market context: usechurch.com · goodmessages.online · reachrightstudios.com

---

## 3. Key patterns observed

1. **5 paid tiers is too many** — most successful tools use 3–4 paid tiers plus free. SermonShots' 5-tier structure creates decision fatigue.
2. **Free tier**: 2–5 clips OR 1 hr of video, watermarked, time-limited (3-day) storage.
3. **Mid-tier is the conversion sweet spot** — SermonShots' Silver and Pulpit AI's Standard are explicitly labeled "most popular."
4. **20% annual discount** is the industry norm (SermonShots, Opus, Vizard, Pulpit all do this). Opus goes 50%, Pulpit does 10%, most sit at 20%.
5. **Africa-specific tools (VerseVision, ChurchCMS) price 5–10× lower** than US tools — the African church market is price-sensitive, but willing to pay in local currency.
6. **Per-minute credit** beats "per sermon" or "per upload" for transparency — Opus, Vizard, Choppity all moved this direction. The market expects to know what they're paying for.
7. **Discipleship bundle** (guides, devotionals) is the unique "premium" SermonShots monetizes — most general tools can't offer this, so it's a defensible value gap.
8. **Translation commands +$50–$100/mo premium** — huge in Africa (English / French / Swahili / Portuguese / Yoruba / Twi / Hausa / Zulu / Afrikaans).
9. **Magic Clips / viral short extraction** is now table stakes — Submagic charges $19/mo as an add-on, but newer entrants bundle it in the base.
10. **Multi-currency + local payment rails (Paystack, M-Pesa, Stripe)** are essential for African market penetration.

---

## 4. Recommended pricing model for RevelationsHub

### Pricing philosophy

- **3 paid tiers + 1 free** — not 5 (avoids decision fatigue)
- **Hour-based credits** (1 credit ≈ 1 min of source video) — transparent, matches Opus / Vizard / Choppity
- **~20% annual discount** with **14-day free trial** on all paid tiers
- **Multi-currency on Paystack** (NGN, KES, GHS, ZAR, USD) — display local-currency price + USD reference
- **"Missionary Pricing" — 30% nonprofit / African-church discount** with verified registration. **This is a defensible moat** that SermonShots and Pulpit do not offer.
- **Position mid-tier as "the one most churches pick"** (industry standard)
- **Magic Clips in the base plan** — table stakes now, not an add-on
- **Discipleship bundle** (discussion guides, devotionals, sermon outlines) is the wedge that justifies the mid-tier price

### Recommended tiers

#### 🆓 **Free — "Taster"** — $0 forever
- 3 clips/month (watermarked, 720p, 9:16 only)
- 30 min of source video upload
- 1 brand template
- 1 user, 1 organization
- 3-day storage
- Community support
- *Lead generation only; no church runs weekly content on this.*

#### ✝️ **Plus — "Preacher"** — **$29/mo** (or **$24/mo billed annually** = $288/yr)
> **Wedge price — 42% under SermonShots Plus ($49.99), matches Opus Pro ($14.50–$29).**

- **Unlimited clips** (key for weekly preaching)
- **5 hours** of source video / month (matches SermonShots)
- Smart Camera Crew (active-speaker reframing)
- Auto-captions with karaoke highlighting + safe zones
- Magic Clips, Image Quotes, Social Carousel
- 1 brand kit, 3 custom templates
- Podcast audio export
- Transcription + basic editing
- YouTube import
- Email support
- 100 GB cloud storage, 30-day retention
- 1 user (+ $9/mo per extra editor seat)

#### 🕊️ **Disciple — "Church"** ⭐ **MOST POPULAR** — **$59/mo** (or **$47/mo billed annually** = $564/yr)
> **Undercuts SermonShots Silver ($67) by 12%, same price as Pulpit Standard ($59) but with more.**

- Everything in Plus, **plus:**
- **10 hours** of source video / month
- **Discipleship bundle**: Discussion Guides, Devotionals (5/week), Sermon Outlines, Blog Post Generator, Summaries
- **Unlimited** brand kits (per campus / ministry)
- 10 custom templates, custom fonts, custom brand colors
- **Team collaboration: 3 editor seats** included
- 500 GB storage, 90-day retention
- 1080p export, no watermark
- **Direct social scheduling** (TikTok, IG, YouTube, FB, LinkedIn, X)
- YouTube import + range selection
- **Multi-language UI**: English, French, Swahili, Portuguese, Yoruba, Twi, Hausa, Zulu, Afrikaans
- Priority support (24-hr email response)
- *This is the conversion tier — where 50–60% of paid users should land.*

#### 👑 **Pastor — "Multi-Campus / Movement"** — **$119/mo** (or **$95/mo billed annually** = $1,140/yr)
> **Collapses SermonShots Gold ($97) + Platinum ($195) into one tier, undercuts Platinum by 39%.**

- Everything in Disciple, **plus:**
- **25 hours** of source video / month
- **Live text + audio translation** in 12+ African languages
- **10 editor seats** + unlimited contributors
- 1 TB storage, 1-year retention
- 4K export
- Advanced text manipulation + **AI Sermon Assistant** (chat with your sermon)
- **API access + webhook integrations** (Subsplash, Planning Center, Pushpay, Tithe.ly, ChurchSuite)
- Custom brand kits per campus
- Audit logs, SSO
- Dedicated success manager + Slack channel

#### 🏢 **Movement — "Enterprise / Denomination"** — **Custom** (starts ~$299/mo)
- Unlimited everything
- Volume-based per-minute pricing
- White-label option for resellers
- Custom SLA, MSA, procurement-friendly invoicing
- Multi-tenant architecture for national denominations

### Add-ons (à la carte, for upsell)

- **Extra upload hours**: $6 per additional hour (any tier)
- **Additional editor seat**: $9/mo on Plus, $6/mo on Disciple
- **Extra brand kit / campus**: $5/mo
- **Translation pack** (Pastor tier and below): $29/mo for 1 extra language, $49/mo for 3+
- **AI B-Roll / Premium templates**: $19/mo add-on
- **Priority render queue**: $15/mo

### One-time credit packs (no subscription, for occasional use)

- **50 credits**: $9 (~3 short sermons)
- **150 credits**: $19 (~1 month of Plus usage)
- **500 credits**: $49 (~3 months of Plus)
- *Credits valid for 12 months.*

### "Missionary Pricing" — Nonprofit / African Church discount

- **30% off** any paid tier with verified registration:
  - Nigeria: CAC certificate
  - Kenya: NGOs Board registration
  - Ghana: Registrar General's Department
  - South Africa: NPO registration
  - US: 501(c)(3) determination letter
  - UK: Charity Commission registration
  - Any other country: equivalent charity / religious-org registration
- Verification: self-certification form on signup + annual reverification, audited by RevelationsHub
- *This is a powerful, defensible positioning differentiator — neither SermonShots nor Pulpit offers this, and African / Asian / Latin American churches will switch to you purely on price.*

### Multi-currency display (Paystack)

| Currency | Use case | Example (Disciple tier) |
|---|---|---|
| USD | Default, global | $59 |
| NGN | Nigeria | ₦90,000 |
| KES | Kenya | KSh 7,600 |
| GHS | Ghana | GH₵ 700 |
| ZAR | South Africa | R 1,100 |
| EUR | Europe | €54 |
| GBP | UK | £46 |

Paystack auto-handles conversion at checkout. Display local price prominently with USD reference.

---

## 5. Summary table

| Tier | Monthly | Annual (per mo) | Best for | Undercuts |
|---|---|---|---|---|
| **Free "Taster"** | $0 | $0 | Trying it (3 clips/mo) | Matches SermonShots free |
| **Plus "Preacher"** | **$29** | $24 | Solo pastor, weekly 1 sermon | **SermonShots Plus $49.99 by 42%** |
| **Disciple "Church"** ⭐ | **$59** | $47 | Single-site church doing full week of content | SermonShots Silver $67 by 12% |
| **Pastor "Movement"** | **$119** | $95 | Multi-campus, multilingual, larger church | SermonShots Gold+Platinum $97+ by 22% |
| **Movement "Enterprise"** | Custom | Custom | Denominations, resellers | Per-minute volume pricing |
| **Missionary discount** | **−30%** off any tier | Same | Verified churches, NGOs | **Nobody else does this** |
| **14-day free trial** | — | — | All paid tiers | Match SermonShots |
| **One-time credit packs** | $9 / $19 / $49 | — | Occasional users | Lower than Castmagic/Hobby |

---

## 6. Why this model wins

1. **Wedge price at Plus ($29)** — undercuts SermonShots Plus by **42%** while offering **more** (active-speaker reframing, social carousels, magic clips, brand kit). General-purpose clippers (Opus, Vizard) hit $15–29 but don't understand sermons, discipleship, or African payment rails. You win on value *and* price.

2. **Conversion tier at Disciple ($59)** — same price as Pulpit Standard but with unlimited brand kits, social scheduling, multi-language UI, and the full discipleship bundle. SermonShots Silver is $67 with fewer features. **This is where 50–60% of paid users should land.**

3. **Premium tier at Pastor ($119)** — collapses SermonShots Gold ($97) + Platinum ($195) into one tier, undercutting Platinum by **39%** while including live audio translation (the #1 premium ask in African churches).

4. **"Missionary Pricing" 30% discount** is your **defensible moat** — neither SermonShots nor Pulpit offers this, and African/Asian/Latin American churches will switch to you purely on price. Marketing it as "Missionary" (not just "nonprofit") aligns with the spiritual brand.

5. **Hour-based credit math** is more transparent than SermonShots' "10 hours" or Pulpit's "5 sermons" — matches the modern standard set by Opus / Vizard / Choppity which churches will compare you to.

6. **Multi-currency on Paystack** (NGN, KES, GHS, ZAR, USD) with **displayed local price** is critical — VerseVision proves Nigerian churches will pay ₦45,000/mo for sermon tools, but they need to **see the naira price**, not "$30".

7. **Magic Clips in the base plan** (not a $19 add-on like Submagic) — table stakes now. Removing it as an upsell avoids leaving money on the table while still feeling generous.

8. **Annual = 20% off** is the industry norm — SermonShots does 20%, Pulpit 10%, Opus 50%. Going 20% is safe and profitable; going higher (Opus 50%) trades margin for cash-flow predictability and is worth testing if cash-flow is critical.

9. **3 paid tiers + free** is the right count — research shows 4-tier pricing converts better than 5-tier (SermonShots' 5-tier structure has a noted UX problem in the strategic PRD).

10. **Discipleship bundle** (Discussion Guides, Devotionals, Sermon Outlines, Blog Post) at the $59 tier is the **unbeatable wedge** — no general-purpose clippers offer this, and SermonShots gates it at $67. A church choosing between $59 RevelationsHub and $67 SermonShots picks you on price *and* on a more modern, single-sidebar UX (per the PRD).

---

## 7. Things to validate with real users before shipping

1. **Is $29 the right Plus price?** — Test $19, $29, $39 against SermonShots' $49.99. The lower you go, the more conversion, the less margin to fund Modal GPU. **Recommended starting point: $29.**

2. **Is 10 hrs/month right for Disciple?** — Most churches do 1 sermon/week × 45 min = ~3 hrs/month. 10 hrs feels generous (good for trust). 5 hrs might be tighter and push upgrades. **Recommended: 10 hrs** (generosity builds goodwill).

3. **Is 30% the right Missionary discount?** — Could be 25% (more margin) or 50% (more share). Test against CACs and church budgets in Lagos, Nairobi, Accra, Joburg. **Recommended starting point: 30%**, with reverification every 12 months.

4. **Paystack vs Stripe** — Keep Paystack for African customers (lower fees, M-Pesa, MTN, Airtel), consider Stripe for US/EU customers. Most churches in the global church space use both rails.

5. **Free trial length** — SermonShots and Pulpit both do 14 days. **Recommended: 14 days, no credit card required** (Pulpit does this; it converts better than requiring a card upfront).

6. **Refunds** — SermonShots offers 30-day money-back. Pulpit does trial-only. **Recommended: 14-day money-back guarantee** on annual plans only (avoids monthly refund churn).

---

## 8. Implementation checklist

- [ ] Update `convex/schema.ts` `subscriptions` table to support new plan names: `free`, `plus`, `disciple`, `pastor`, `movement` (or keep `silver`/`gold`/`platinum` as legacy aliases)
- [ ] Update `convex/subscriptions.ts` plan literals to match
- [ ] Update `revelationshub/src/app/pricing/page.tsx` with new tier cards, badges, and "Missionary Pricing" callout
- [ ] Add new constants for `clipCredits` per tier (e.g., `PLUS_CREDITS = 300`, `DISCIPLE_CREDITS = 600`, `PASTOR_CREDITS = 1500`)
- [ ] Implement Paystack multi-currency checkout (NGN, KES, GHS, ZAR, USD)
- [ ] Build self-service "Missionary Pricing" verification form (upload CAC/501(c)(3)/Charity Commission document, admin approval queue)
- [ ] Add credit pack purchase flow in app (one-time, not subscription)
- [ ] Add usage dashboard so churches can see `clipsUsed / clipCredits` remaining
- [ ] Add paywall upsells when `clipsUsed >= clipCredits` (e.g., "You have 12 days left in your billing cycle. Upgrade or buy a credit pack.")
- [ ] Update `PRD.md` and `Strategic Product Design & Requirements Report` to reflect new tier names and pricing
- [ ] Add tier comparison table to landing page (the "Compare all features" link from SermonShots model)
- [ ] Marketing site copy: lead with **42% cheaper than SermonShots** + **Missionary Pricing** + **African-first** in headlines
