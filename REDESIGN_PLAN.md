## Piccatso AI Art Store — Redesign Plan

### Objectives
- **Instant value comprehension**: In under 5 seconds, communicate “Turn your photo into gallery‑worthy art and get it shipped.”
- **Frictionless creation**: Upload → Preview styles → Select format/size → Add to cart.
- **Preserve Piccatso**: Keep the existing Piccatso Shopify app for upload/preview; redesign everything else around it.
- **Conversion focus**: Clear CTAs, trust signals, and streamlined product options.

### Information Architecture
- **Header nav**: Create, Gallery, Formats, Help
- **Primary action**: Persistent “Create yours” button in the header
- **Footer**: Shipping, Returns, FAQ, Contact, Privacy

### Home Page Layout
- **Fold 0 (Hero)**
  - Headline: “Turn your photo into gallery‑worthy art in seconds.”
  - Subhead: “Upload → Preview styles → Print on museum‑grade paper or canvas.”
  - Primary CTA: “Create yours” (anchors to uploader)
  - Visual proof: simple before/after slider or mini thumbnails
- **Immediate Uploader**: Embed the Piccatso app block directly under the hero for zero‑friction start
- **How it works (3 steps)**: Upload, Pick a style, Print & ship
- **Style sampler**: 5–7 hero styles with micro previews
- **Formats & pricing**: Poster/Canvas/Framed, size matrix, shipping window
- **Social proof**: UGC grid + reviews
- **FAQ**: Image quality, IP/rights, delivery times, returns

### Creation Flow (Piccatso‑powered)
- Dedicated Create page centered on the Piccatso upload/preview block
- Steps sidebar/stepper: 1) Upload, 2) Choose style, 3) Preview, 4) Select size/material/frame, 5) Add to cart
- Shortcuts: “Restart with another photo,” “Save this preview”
- Performance: lazy‑load everything beneath the uploader

### Product Setup (Shopify)
- Single customizable product: “AI Art Print”
  - **Variants**
    - Size: A4, A3, A2, 12x16, 18x24, 24x36 (adjust to offering)
    - Material: Poster, Canvas
    - Frame: None, Black, White (optional)
    - Orientation: Portrait, Landscape (optional)
  - **Pricing**: Tiers by size/material; highlight “Most popular”
- **Line item properties**: Store Piccatso render ID/URL and chosen style on the cart item

### Product Page Changes
- Place the Piccatso block above the variant picker so preview comes first
- Simplify above‑the‑fold: price, variant picker, quantity, add‑to‑cart
- Show “What you’ll get,” shipping ETA, and quality badges near CTA; collapse long copy

### Cart & Checkout
- Use cart drawer; show thumbnail of generated art (Piccatso image URL)
- Trust signals: “48‑hour production,” “Free replacements for print defects,” “Secure checkout”
- Optional upsell: Frame, expedited shipping

### Visual Direction (millennial, clean)
- **Palette**: warm neutrals + one electric accent (e.g., electric violet) for CTAs
- **Typography**: bold display for headlines, highly legible body; generous whitespace
- **Buttons**: pill shape, high‑contrast, subtle hover scale
- **Micro‑interactions**: fade‑in previews, smooth stepper animations

### Content To Prepare
- 6–10 before→after style examples
- In‑home lifestyle shots of framed prints
- Crisp FAQ, shipping, returns, and materials copy

### Metrics Targets
- LCP home < 2.0s mobile; TTI < 3.5s
- Create CTA CTR > 5–8%
- Add‑to‑cart from Create flow > 3–5%

### Piccatso App Embedding (existing)
The home template already embeds the Piccatso uploader via an `apps` section:

```json
// piccatso/templates/index.json (excerpt)
{
  "type": "apps",
  "blocks": {
    "piccatso_tool_upload_picker_PLjpaW": {
      "type": "shopify://apps/piccatso-tool/blocks/upload_picker/d220211d-db7d-40be-8645-fc17888bb8ee",
      "settings": { "heading": "Turn your moments into masterpieces" }
    }
  }
}
```

The product section supports `@app` blocks, so the Piccatso block can render above options:

```liquid
{%- case block.type -%}
  {%- when '@app' -%}
    {% render block %}
{%- endcase -%}
```

### Implementation Steps Mapped to Files
- **Header/navigation**
  - `sections/header.liquid`: simplify nav to Create, Gallery, Formats, Help; add primary “Create yours” button
  - `config/settings_schema.json`: optional brand color/typography settings
- **Home template**
  - `templates/index.json`: position `apps` (Piccatso) right under hero; update hero copy and CTA
  - Add “How it works” via `sections/multicolumn.liquid`; formats/pricing via `multicolumn` or `rich-text` and table markup; UGC via `collage.liquid`; FAQ via `collapsible-content.liquid`
- **Create page**
  - `templates/page.json` (new template variant): include only `sections/apps.liquid` with the Piccatso block
- **Product page**
  - `sections/main-product.liquid`: ensure `@app` block renders above `variant_picker`; keep only price, variants, qty, buy buttons
  - `snippets/buy-buttons.liquid`: add line item properties for Piccatso render metadata
- **Cart drawer imagery**
  - `snippets/cart-drawer.liquid` + `assets/component-cart-drawer.css/js`: show generated preview thumbnail if present
- **Performance**
  - `layout/theme.liquid`: preload hero font; compress hero media; disable non‑essential scripts on create/product templates
- **Copy & localization**
  - `locales/en.default.json`: add new strings for hero, steps, FAQ

### Rollout Sequence
1. IA + header simplification and CTA
2. Home hero + Piccatso uploader moved up
3. Create page focused flow
4. Product variants + line item properties for render metadata
5. Formats/pricing + trust/FAQ
6. Cart drawer preview
7. UGC/reviews

### Next Actions
- Reorder `templates/index.json` to place the Piccatso `apps` section directly under the hero and update hero copy/CTA.
- Create a “Create” page template embedding the Piccatso block as the sole focal element.
- Streamline `sections/main-product.liquid` so the app preview sits above the variant options.


