# Design spec

Owner's UI/UX prompt, saved word for word below the line. Private file. Design only: no structure, features or backend.

## Notes for agents (added when saved)

Read before using the spec.

1. **Palette conflict, unresolved (Q13).** The spec says Electric Cyan `#16DDF5` and Neon Magenta `#ED20D5` on purple-black. Earlier the owner asked for the poster theme with soft pink and calm blue (D14, live in `assets/css/style.css`: `#eb8ed2`, `#6aafdc`, navy `#060a18`). Do not switch palettes until the owner answers. The spec itself also says "avoid excessive neon effects".
2. **Weight on phones.** Glitch text, particles, noise, polygon art, GSAP, Motion and Lenis all cost. Lazy-load them, use them on the hero and a few sections only, simplify on mobile, honour `prefers-reduced-motion`, and keep the site light (`AGENTS.md` rule 2).
3. **Artwork.** The spec asks for 3D sculptures and polygonal heads. Do not add heavy 3D libraries. Use the poster figure (`assets/img/bg/figure.webp`) plus CSS or SVG wireframes and light blooms until the owner supplies assets.
4. **Reference site.** JunctionX Tirana 2026 was named but not attached. Take its visual language only. Do not copy it.
5. **Fonts.** Space Grotesk, Inter and JetBrains Mono are free (Google Fonts). Self-host them with `next/font` in the rebuild. Load only the weights used.
6. **Where it applies.** Tokens and components go into the Next.js rebuild (Tailwind 4 `@theme`). The old static site is a throwaway; do not port the whole spec to it.
7. **Accessibility.** Check contrast for every text and accent colour. Keep focus rings visible. The spec's own rules (14) say the same.

---

SANKALP'26 — UI/UX Design Prompt

Design a premium, futuristic, visually striking UI for SANKALP'26, inspired by the JunctionX Tirana 2026 website reference.

Focus exclusively on visual design, typography, colors, buttons, components, spacing, interactions, animations and responsive behavior.

Do not generate application architecture, routing, database schemas, backend logic, API endpoints or website structure.

1. Visual Identity

Create a futuristic cyberpunk aesthetic with a premium editorial feel.

The design should communicate:

- Innovation
- Artificial intelligence
- Technology
- Competition
- Creativity
- Future-oriented thinking

Use the JunctionX reference for its visual language, not as a template to copy.

2. Color Palette

Use a consistent dark color system.

Color| Hex
Void Black| #080510
Deep Purple| #100819
Midnight Purple| #160C22
Electric Cyan| #16DDF5
Neon Magenta| #ED20D5
Soft White| #F5F3FA
Muted Gray| #A29AAC
Border| #30233C

Primary gradient:

"linear-gradient(100deg, #16DDF5, #ED20D5)"

Use cyan and magenta as signature accent colors. Keep the background predominantly dark.

3. Typography

Use three complementary fonts:

Space Grotesk

- Large headings.
- Hero typography.
- Section titles.
- Important statistics.

Inter

- Body text.
- Navigation.
- Buttons.
- Form labels.
- General UI.

JetBrains Mono

- Countdown timers.
- Dates.
- Technical labels.
- Small uppercase metadata.
- Team identifiers.

Typography should have strong visual hierarchy, generous line height and carefully controlled letter spacing.

Use large, bold, expressive typography for important headings.

Use responsive font sizing with CSS clamp().

4. Hero Typography and Text Effects

Create distinctive futuristic typography.

- Large uppercase headings.
- Cyan and magenta chromatic offset effects.
- Subtle glitch effects on selected text.
- Gradient text highlights.
- Carefully controlled text shadows.
- Small uppercase metadata with wide letter spacing.

Avoid applying glitch effects to every heading.

5. Buttons

Create a consistent button design system.

Primary button

- Cyan-to-magenta gradient.
- Strong contrast.
- Subtle neon glow.
- Smooth hover transition.
- 8px border radius.

Secondary button

- Transparent background.
- Thin cyan border.
- Cyan text.
- Subtle illuminated hover state.

Ghost button

- Transparent background.
- Minimal styling.
- Muted text.
- Bright text on hover.

Destructive button

- Red/pink accent.
- Clear warning appearance.

Button heights:

- Small: 32px.
- Medium: 40px.
- Large: 48px.
- Extra large: 54px.

Include hover, active, focus, disabled and loading states.

Use lucide-react icons consistently.

6. Input and Form Styling

Create premium dark-themed input fields.

- Dark transparent backgrounds.
- Subtle borders.
- Light text.
- Muted placeholders.
- Cyan focus borders.
- Soft focus glow.
- Smooth transitions.
- Consistent padding and heights.

Style text inputs, password fields, search bars, dropdowns, textareas, checkboxes, radio buttons, switches and file upload areas consistently.

Validation errors should be clear and visually distinct.

7. Cards and Panels

Use a refined combination of dark surfaces and subtle borders.

Standard cards

- Dark purple surface.
- Thin low-contrast border.
- 12px border radius.
- Consistent padding.
- Subtle hover transitions.

Highlighted cards

- Selective cyan or magenta accent borders.
- Controlled neon glow.
- Gradient details.

Statistics cards

- Large numerical typography.
- Small labels.
- Minimal icons.

Profile cards

- Clean avatars.
- Clear information hierarchy.
- Subtle accent details.

Avoid excessive glassmorphism, gradients and glowing borders.

8. Navigation and Interactive Elements

Use minimalist, premium navigation styling.

- Small uppercase navigation labels.
- Wide letter spacing.
- Muted default color.
- White hover state.
- Cyan active indicator.
- Subtle background transition.

Use consistent styling for:

- Dropdowns.
- Tabs.
- Tooltips.
- Modals.
- Dialogs.
- Notifications.
- Badges.
- Progress indicators.
- Pagination.
- Tables.
- Avatars.

9. Background and Visual Effects

Use visually rich but restrained backgrounds.

Possible effects:

- Dark purple radial gradients.
- Subtle noise texture.
- Fine grid patterns.
- Thin geometric lines.
- Abstract polygonal elements.
- Floating particles.
- Cyan and magenta light blooms.
- Subtle blurred light effects.

Avoid excessive particles and distracting backgrounds.

10. Artwork and Imagery

Take inspiration from the JunctionX reference.

Preferred visual direction:

- Futuristic human or AI-inspired 3D sculptures.
- Abstract geometric heads.
- Polygonal wireframes.
- Fragmented 3D structures.
- Metallic and glass-like surfaces.
- Cyan and magenta illumination.
- Floating geometric fragments.

Avoid generic stock images, ordinary corporate illustrations and cartoon graphics.

Use high-quality assets that complement the typography instead of competing with it.

11. Animation and Motion

Use:

- GSAP.
- Motion.
- Lenis.

Animation direction:

- Smooth entrance transitions.
- Staggered text reveals.
- Subtle image parallax.
- Geometric floating effects.
- Button hover transitions.
- Smooth modal transitions.
- Gentle card interactions.
- Section reveal animations.

Animations must feel intentional, fluid and premium.

Respect reduced-motion preferences and avoid unnecessary continuous animations.

12. Spacing and Layout Styling

Use a consistent 4px spacing scale.

Maintain:

- Generous whitespace.
- Balanced alignment.
- Consistent content widths.
- Clear visual grouping.
- Strong typography hierarchy.
- Consistent vertical rhythm.

Use approximately 1280px as the maximum desktop content width.

Avoid cramped layouts and excessive decorative elements.

13. Responsive Styling

The design must adapt beautifully to desktop, laptop, tablet and mobile screens.

On mobile:

- Reduce oversized typography appropriately.
- Maintain readable spacing.
- Keep buttons touch-friendly.
- Prevent horizontal overflow.
- Simplify decorative effects.
- Preserve the visual identity.
- Make forms comfortable to use.

14. Design Consistency Rules

- Use the same fonts throughout.
- Maintain a consistent color system.
- Reuse button styles.
- Keep border radii consistent.
- Maintain consistent input styling.
- Use icons from lucide-react.
- Avoid random shadows.
- Avoid unnecessary animations.
- Maintain accessible color contrast.
- Use clear focus indicators.
- Avoid excessive neon effects.
- Prioritize readability and usability.

Final Design Direction

The final UI should feel like a premium international technology hackathon experience.

Combine the cinematic futuristic identity of JunctionX Tirana with the cyan-magenta identity of SANKALP'26.

The result should be dark, bold, minimal, futuristic, immersive and professionally polished.

Focus entirely on the quality and consistency of the visual interface. Do not introduce website structure, feature specifications or backend implementation details.

## Hero head prompt (user, verbatim)

SANKALP'26 — Animated Futuristic 3D Human Head

Create a premium, ultra-detailed 3D futuristic human head sculpture inspired by the original SANKALP'26 brochure artwork.

The sculpture will serve as the main visual element and animated background artwork for the SANKALP'26 hackathon website.

1. Subject and Appearance

Create a realistic, gender-neutral human head with an upper neck.

- Highly detailed human facial anatomy.
- Defined nose, lips, cheekbones, jawline and forehead.
- Smooth metallic and semi-translucent surfaces.
- Futuristic digital sculpture aesthetic.
- Elegant, symmetrical facial proportions.
- Realistic human appearance, not a robot or cartoon.

The head should have an artistic combination of organic human anatomy and futuristic computational geometry.

2. Polygonal Construction

Preserve the distinctive fragmented geometric appearance of the SANKALP'26 brochure.

Incorporate:

- Intricate triangular polygon meshes.
- Fine geometric wireframes.
- Faceted metallic surfaces.
- Transparent glass-like fragments.
- Floating geometric shards.
- Small suspended particles.
- Fragmented sections around the skull and back of the head.

Some areas should gradually transition from solid facial surfaces into intricate polygonal structures.

The geometry should appear sophisticated, precise and intentional.

Maintain a recognizable human silhouette throughout the animation.

3. Exact Design Kit Color Palette

Follow the SANKALP'26 Design Kit.

Primary background

- Void Black: "#080510"
- Deep Purple: "#100819"
- Midnight Purple: "#160C22"

Lighting accents

- Cyan: "#62C6E4"
- Pink: "#E98FD0"

Additional tones

- Soft White: "#F5F3FA"
- Muted Gray: "#A29AAC"

Use the cyan and pink as two soft complementary light sources.

Do not use excessively saturated neon colors.

The lighting should be atmospheric, refined and cinematic.

4. Lighting and Materials

Use:

- Dark reflective titanium.
- Brushed metallic chrome.
- Translucent glass.
- Semi-transparent holographic surfaces.
- Fine glowing polygonal wireframes.
- Subtle internal illumination.

Lighting arrangement:

- Soft cyan illumination from the left.
- Soft pink illumination from the right.
- Deep purple ambient shadows.
- Subtle rim lighting around the head.
- Controlled reflections across facial surfaces.

Avoid overexposure and excessive bloom.

Facial details must remain visible.

5. Animation — Head Rotation

Create one continuous, smooth 3D rotation around the vertical Y-axis.

The animation must have consistent geometry and lighting throughout.

Phase 1 — Left-facing profile (0%)

- Head faces completely left.
- Clear side-profile silhouette.
- Nose points toward the left.
- One eye is visible.
- Polygon fragments float around the back of the skull.
- Neck remains naturally connected.

Phase 2 — Three-quarter view (25%)

- Slowly rotate the head toward the viewer.
- Reveal more of the facial structure.
- Both cyan and pink lighting become visible across the face.
- Geometric fragments move subtly around the head.

Phase 3 — Almost frontal (50%)

- Head continues its smooth rotation.
- Both eyes become visible.
- Nose approaches the center.
- Facial proportions remain unchanged.
- Wireframe geometry becomes more visible.

Phase 4 — Frontal view (75%)

- Head approaches a direct frontal position.
- Symmetrical facial structure.
- Balanced cyan and pink illumination.
- Floating particles remain subtle.

Phase 5 — Perfect frontal view (100%)

- Head faces directly toward the camera.
- Both eyes look straight ahead.
- Perfectly aligned nose and facial center.
- Strong but controlled cinematic rim lighting.
- Maintain the same identity, geometry and proportions.

The final frontal pose should feel powerful, intelligent and futuristic.

6. Geometric Particle Behaviour

Throughout the animation:

- Small geometric fragments float around the skull.
- Some fragments slowly rotate.
- A few fragments subtly move outward from the back of the head.
- Fine wireframe structures remain attached to the sculpture.
- Particles should move slowly and naturally.

Do not let fragments obscure the face.

Avoid excessive particle density.

7. Camera and Composition

- Fixed camera.
- No camera cuts.
- No zooming.
- No sudden perspective changes.
- Three-quarter and side profiles must remain visually clear.
- Head and upper neck only.
- Preserve sufficient negative space around the subject.

The sculpture should be large enough to dominate a desktop website hero section.

8. Background

Use the SANKALP'26 dark environment.

- Void Black base.
- Subtle Deep Purple atmospheric gradient.
- Soft cyan and pink light blooms.
- Fine noise texture.
- Very subtle geometric wireframe details.
- Minimal floating particles.

The background must blend naturally with "#080510".

Prefer a transparent background if the rendering pipeline supports it.

Do not include typography, logos, text, watermarks or additional characters.

9. Technical Animation Requirements

The animation must be suitable for scroll-driven playback.

Required rotation mapping:

Scroll progress| Head orientation
0%| Left-facing profile
25%| Three-quarter left
50%| Almost frontal
75%| Nearly frontal
100%| Direct frontal

Requirements:

- Deterministic animation.
- Consistent geometry between frames.
- No random changes in facial features.
- No morphing or identity changes.
- Smooth interpolation.
- Seamless frame continuity.
- Stable lighting and materials.

Prefer a controllable 3D model or rendered animation sequence with sufficient intermediate frames.

10. Final Artistic Direction

The final sculpture should resemble a premium futuristic digital human artwork created for an international technology event.

Visual keywords:

Futuristic human sculpture, polygonal geometry, fragmented digital anatomy, metallic surfaces, holographic glass, soft cyan lighting, muted pink illumination, deep purple shadows, cinematic 3D rendering, computational art, premium cyberpunk aesthetic.

Most important: Preserve the original brochure's recognizable 3D human-head concept while making it more sophisticated, detailed and suitable for an immersive scroll-driven website experience.

- Agent note: needs rendered frames or a 3D model. Scroll maps 0-100% to profile-left to frontal. Status: waiting on user choice of how to produce it.
