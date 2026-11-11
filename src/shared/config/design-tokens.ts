// Source: Cafe · Tokens (8613:926), Light/Dark; see docs/foundations.md.
export const semanticColors = {
  "light": {
    "background-body": "#f4f1ec",
    "background-surface": "#ffffff",
    "background-hover": "#f4f1ec",
    "background-filled": "#efeae3",
    "background-disabled": "#eae4dc",
    "background-overlay": "#00000099",
    "background-primary-filled": "#77513b",
    "background-primary-filled-hover": "#62422f",
    "background-primary-light": "#efe4d9",
    "background-primary-light-hover": "#e5d5c5",
    "text-default": "#29231f",
    "text-dimmed": "#71645a",
    "text-placeholder": "#71645a",
    "text-disabled": "#8d8278",
    "text-primary": "#77513b",
    "text-on-primary": "#ffffff",
    "text-on-success": "#ffffff",
    "text-on-warning": "#ffffff",
    "text-on-error": "#ffffff",
    "text-on-info": "#ffffff",
    "border-default": "#d7cec4",
    "border-control": "#988476",
    "border-hover": "#71645a",
    "border-focus": "#77513b",
    "border-error": "#b42318",
    "status-success": "#356340",
    "status-success-hover": "#2a5033",
    "status-success-light": "#e8f1e7",
    "status-warning": "#805900",
    "status-warning-hover": "#674700",
    "status-warning-light": "#f7edcf",
    "status-error": "#b42318",
    "status-error-hover": "#912018",
    "status-error-light": "#fee4e2",
    "status-info": "#3f6073",
    "status-info-hover": "#304c5d",
    "status-info-light": "#e1eaf0",
    "background-white": "#ffffff",
    "background-white-hover": "#f7f2ec",
    "text-on-white": "#77513b"
  },
  "dark": {
    "background-body": "#1d1a17",
    "background-surface": "#27221e",
    "background-hover": "#342c25",
    "background-filled": "#332b25",
    "background-disabled": "#342d27",
    "background-overlay": "#000000b3",
    "background-primary-filled": "#d2aa8c",
    "background-primary-filled-hover": "#e0bda2",
    "background-primary-light": "#3a2e24",
    "background-primary-light-hover": "#49392c",
    "text-default": "#f0e9e1",
    "text-dimmed": "#b8a99b",
    "text-placeholder": "#b8a99b",
    "text-disabled": "#8f8073",
    "text-primary": "#d2aa8c",
    "text-on-primary": "#281c14",
    "text-on-success": "#182e1d",
    "text-on-warning": "#302305",
    "text-on-error": "#3b1511",
    "text-on-info": "#192b35",
    "border-default": "#51463d",
    "border-control": "#927f6f",
    "border-hover": "#b8a99b",
    "border-focus": "#d2aa8c",
    "border-error": "#fda29b",
    "status-success": "#a7d9b1",
    "status-success-hover": "#bce5c4",
    "status-success-light": "#263c2c",
    "status-warning": "#e5c176",
    "status-warning-hover": "#f0d28d",
    "status-warning-light": "#43391f",
    "status-error": "#fda29b",
    "status-error-hover": "#fec0ba",
    "status-error-light": "#4a211f",
    "status-info": "#a0c1d1",
    "status-info-hover": "#b6d1dd",
    "status-info-light": "#2b3e49",
    "background-white": "#ffffff",
    "background-white-hover": "#f7f2ec",
    "text-on-white": "#77513b"
  }
} as const;

export const cafePalette = [
  "#f7f2ec",
  "#efe4d9",
  "#e0bda2",
  "#d2aa8c",
  "#b38c6c",
  "#987154",
  "#77513b",
  "#62422f",
  "#483020",
  "#281c14"
] as const;

export const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type FoundationSize = (typeof sizes)[number];
export const fontSizes = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20 } as const;
export const lineHeights = { xs: 1.4, sm: 1.45, md: 1.55, lg: 1.6, xl: 1.65 } as const;
export const spacing = { xs: 10, sm: 12, md: 16, lg: 20, xl: 32 } as const;
export const radius = { xs: 2, sm: 4, md: 8, lg: 16, xl: 32 } as const;
export const controlHeight = { xs: 30, sm: 36, md: 42, lg: 50, xl: 60 } as const;
export const buttonPadding = { xs: 14, sm: 18, md: 22, lg: 26, xl: 32 } as const;
export const inputPadding = { xs: 10, sm: 12, md: 14, lg: 50 / 3, xl: 20 } as const;
export const badgeHeight = { xs: 16, sm: 18, md: 20, lg: 26, xl: 32 } as const;
export const badgeFontSize = { xs: 11, sm: 12, md: 12, lg: 13, xl: 16 } as const;
export const badgePadding = { xs: 6, sm: 8, md: 10, lg: 12, xl: 16 } as const;
export const modalWidth = { xs: 320, sm: 380, md: 440, lg: 620, xl: 780 } as const;
export const headings = {
  h1: { fontSize: '2.125rem', lineHeight: '1.3' },
  h2: { fontSize: '1.625rem', lineHeight: '1.35' },
  h3: { fontSize: '1.375rem', lineHeight: '1.4' },
  h4: { fontSize: '1.125rem', lineHeight: '1.45' },
  h5: { fontSize: '1rem', lineHeight: '1.5' },
  h6: { fontSize: '0.875rem', lineHeight: '1.5' },
} as const;
export const modalShadow = '0 1px 3px 0 #0000000d, 0 20px 25px -5px #0000000d, 0 10px 10px -5px #0000000a';
