# CafeInn visual foundations

Source: [CafeInn Figma](https://www.figma.com/design/uFGpsRjt8VmGoUInMn4XNA), read on 2026-11-11. Foundations: Light `8628:924`, Dark `8628:1041`; variables: Cafe · Tokens `8613:926`. This document and the repository assets are sufficient for an independent clone. Figma access is only needed when updating the specification.

## Ownership and use

- `src/shared/config/design-tokens.ts` owns verified source values. `theme-variables.ts` exposes CSS roles as `--cafe-<lowercase-hyphenated-role>` and binds Mantine semantic variables.
- `theme.ts` composes typography, the verified Cafe palette, and `theme-components.ts`. Scoped component states live in `src/shared/styles/foundations.module.css`.
- Use Mantine props and semantic roles before adding CSS. Button and Badge support `color="success" | "warning" | "error" | "info" | "neutral"`; their default color is Cafe. These semantic names are resolver roles, not ten-shade palettes. Other explicit Mantine colors, shade references, gradients, and raw CSS colors retain the native resolver.
- The real ten-shade Cafe palette is `#f7f2ec, #efe4d9, #e0bda2, #d2aa8c, #b38c6c, #987154, #77513b, #62422f, #483020, #281c14`. No shades are interpolated. Light primary shade is 6; Dark is 3. Scheme-specific roles still control primary backgrounds, text, and hover.
- Light is the default. Mantine's standard color-scheme manager persists an explicit selection in `localStorage["mantine-color-scheme"]`. ColorSchemeScript and MantineProvider share the same default.
- Locale remains independent: Vietnamese is the default and the existing locale cookie remembers vi/en. The mode controls appear only in the development gallery.

## Semantic color mapping

Every row is verified from the Light and Dark variable modes, including aliases resolved to primitives. Alpha is preserved in eight-digit hex.

| Figma role | Light | Dark |
| --- | --- | --- |
| Background/body | `#f4f1ec` | `#1d1a17` |
| Background/surface | `#ffffff` | `#27221e` |
| Background/hover | `#f4f1ec` | `#342c25` |
| Background/filled | `#efeae3` | `#332b25` |
| Background/disabled | `#eae4dc` | `#342d27` |
| Background/overlay | `#00000099` | `#000000b3` |
| Background/Primary/filled | `#77513b` | `#d2aa8c` |
| Background/Primary/filled-hover | `#62422f` | `#e0bda2` |
| Background/Primary/light | `#efe4d9` | `#3a2e24` |
| Background/Primary/light-hover | `#e5d5c5` | `#49392c` |
| Text/default | `#29231f` | `#f0e9e1` |
| Text/dimmed | `#71645a` | `#b8a99b` |
| Text/placeholder | `#71645a` | `#b8a99b` |
| Text/disabled | `#8d8278` | `#8f8073` |
| Text/Primary | `#77513b` | `#d2aa8c` |
| Text/on-primary | `#ffffff` | `#281c14` |
| Text/on-success | `#ffffff` | `#182e1d` |
| Text/on-warning | `#ffffff` | `#302305` |
| Text/on-error | `#ffffff` | `#3b1511` |
| Text/on-info | `#ffffff` | `#192b35` |
| Border/default | `#d7cec4` | `#51463d` |
| Border/control | `#988476` | `#927f6f` |
| Border/hover | `#71645a` | `#b8a99b` |
| Border/focus | `#77513b` | `#d2aa8c` |
| Border/error | `#b42318` | `#fda29b` |
| Status/success | `#356340` | `#a7d9b1` |
| Status/success-hover | `#2a5033` | `#bce5c4` |
| Status/success-light | `#e8f1e7` | `#263c2c` |
| Status/warning | `#805900` | `#e5c176` |
| Status/warning-hover | `#674700` | `#f0d28d` |
| Status/warning-light | `#f7edcf` | `#43391f` |
| Status/error | `#b42318` | `#fda29b` |
| Status/error-hover | `#912018` | `#fec0ba` |
| Status/error-light | `#fee4e2` | `#4a211f` |
| Status/info | `#3f6073` | `#a0c1d1` |
| Status/info-hover | `#304c5d` | `#b6d1dd` |
| Status/info-light | `#e1eaf0` | `#2b3e49` |
| Background/white | `#ffffff` | `#ffffff` |
| Background/white-hover | `#f7f2ec` | `#f7f2ec` |
| Text/on-white | `#77513b` | `#77513b` |

## Typography and geometry

Be Vietnam Pro normal weights: 400 body, 500 control labels, 600 headings/badges. The theme maps regular/medium/bold to 400/500/600 and exposes semibold=600. Synthetic weights are disabled. No italic files are included.

| Size | Text px / line-height | Spacing px | Radius px | Button/Input height px | Button padding X px | Input padding X px |
| --- | --- | --- | --- | --- | --- | --- |
| xs | 12 / 1.4 | 10 | 2 | 30 | 14 | 10 |
| sm | 14 / 1.45 | 12 | 4 | 36 | 18 | 12 |
| md | 16 / 1.55 | 16 | 8 | 42 | 22 | 14 |
| lg | 18 / 1.6 | 20 | 16 | 50 | 26 | 50/3 |
| xl | 20 / 1.65 | 32 | 32 | 60 | 32 | 20 |

Headings h1–h6: 34/1.3, 26/1.35, 22/1.4, 18/1.45, 16/1.5, 14/1.5, all 600. All six local Cafe heading styles were verified. Default radius is md (8px). CSS lengths use rem where supported; explicit numeric exceptions remain deliberate. Mantine named spacing differs from the numeric `Space/*` tokens.

Badge xs–xl heights: 16/18/20/26/32px; text: 11/12/12/13/16px; horizontal padding: 6/8/10/12/16px. Essential labels should use sm or larger. Small controls require an appropriate surrounding touch layout.

Modal xs–xl widths: 320/380/440/620/780px, constrained by the viewport. Padding is 16px. The verified md shadow is `0 1px 3px 0 #0000000d, 0 20px 25px -5px #0000000d, 0 10px 10px -5px #0000000a`.

## Component coverage and fallbacks

| Component | Source and applied coverage | Retained defaults / limits |
| --- | --- | --- |
| Button | Filled matrix `8616:1088`, focused md `8616:1004`; light/outline/subtle/default/white/destructive sets `8617:105401` through `8617:106231`. Semantic variants, dimensions, label weight, disabled colors, and 2px focus outline with 3px offset. | Native loading indicator/overlay, compact/custom sizes, gradients, explicit unrelated colors. Unspecified status light hover keeps the same source light background. |
| Input/TextInput/NumberInput | Input `8618:1285`, TextInput `8621:106085`, NumberInput `8622:1489`. Shared geometry, surface/filled/unstyled, border, hover/focus, error, disabled, label weight. | Native label/description layout, number controls, loading and success behavior. No custom business validation. |
| Badge | `8624:2250` and filled/outline/dot families. Semantic tones, sizes, text case/weight, borders and dot color. | Native clipping/circle/section behavior and unrelated colors. |
| Paper/Card | Source surface, border and radius roles; md modal elevation. | No dedicated full Card specification was established. Other shadow sizes, layout, and padding retain Mantine defaults. |
| Modal | `8625:106716`: source widths, surface, heading typography, padding, overlay and md shadow. | Native focus trap, Escape, focus return, responsive offsets, close icon and transitions. Individual Modal shadow overrides remain respected. |
| Table | Core table cell `8684:1917`: semantic borders, 14px text and shared line-height. Source recommends left-aligned long text and right-aligned amounts. | Prototype 64px row height is not a universal business density rule. Density, selection, sorting, business columns and header layouts remain unspecified/native. |
| Other Mantine components | Shared typography and semantic variables where consumed. | Their component-specific palettes, geometry and interactions remain defaults; no full-library parity claim. |

No AppShell, business screen, animation system, or global Figma sync is included. The gallery is a review tool rather than a pixel-for-pixel copy of a Figma board.

## Fonts and brand assets

Fonts come from [Google Fonts / Be Vietnam Pro](https://github.com/google/fonts/tree/c13390277dfb1fcc7415d84ef7ef9cfc1e52f8c1/ofl/bevietnampro), pinned revision `c13390277dfb1fcc7415d84ef7ef9cfc1e52f8c1`. The original SIL Open Font License is retained at `src/shared/assets/fonts/be-vietnam-pro/OFL.txt`. next/font/local serves all three weights from this application, without Google font requests.

| File | SHA-256 |
| --- | --- |
| BeVietnamPro-Regular.ttf | `cd1ef6e9d7db28ad5cdb88a65ccbe693870e60d340b791f349d248342b4fe4c3` |
| BeVietnamPro-Medium.ttf | `b60832bfa0fcd015158112c64d7e3fdad3b0c6287d1823f85a3103636e845268` |
| BeVietnamPro-SemiBold.ttf | `bd8e27eb02720b9d91e59e4f10a90878643219f25ce6a8d9a4f06a8a88d3bb71` |

Approved logo: “01 · Nốt cà phê · Đã chốt” (`8659:1016`). Exported SVGs in `public/brand/` retain the original artwork, outlined lettering, intrinsic dimensions and proportions. They have no external image/font references. The 128×128 mark is `8659:930`; the 353×128 Light lockup is `8659:938`; the 217×77 inverse export is `8659:1032`. BrandLogo displays the matching asset with scheme-aware CSS and one visible accessible image; the gallery shows the brown mark on a Light brand tile.

| File | SHA-256 |
| --- | --- |
| cafeinn-mark.svg | `1b758886833e76ae047fc574e70776008de69b8a28c704e69a3786e037b68f5c` |
| cafeinn-lockup-light.svg | `0fd77d5da06c3a1fdc4afaa35b4f70d4d162cd7b30b9577143f37b64475d690a` |
| cafeinn-lockup-dark.svg | `dbc9c9ce4a41a091c02f7cd13eccfbeb10f5d77a70a9844115451d99de884da7` |

## Review and updates

Run the existing lint, typecheck, test and build scripts. In development, visit `/dev/foundations`; in production the route calls notFound and must return 404. Check both languages and modes, reload persistence, keyboard focus, input states, modal Escape/focus return, logo geometry and narrow layouts. Local fixtures need no API or database.

Source contrast pairs: body text/surface 15.50:1 Light and 13.08:1 Dark; primary label/fill 6.94:1 and 7.79:1; control border/surface 3.56:1 and 4.11:1. These checks do not establish full WCAG compliance. Disabled controls, decorative swatches, and unmodified Mantine fallback palettes are not included in those ratios.

For a design change, read the exact node/variable modes and screenshot first, update the tokens and this mapping together, and verify rendered states. Keep missing values documented as fallbacks. Ask for a source decision when specifications conflict or a source foreground/background pair fails contrast; do not silently recolor the design.
