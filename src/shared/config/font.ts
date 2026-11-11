import localFont from 'next/font/local';

export const cafeFont = localFont({
  src: [
    { path: '../assets/fonts/be-vietnam-pro/BeVietnamPro-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../assets/fonts/be-vietnam-pro/BeVietnamPro-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../assets/fonts/be-vietnam-pro/BeVietnamPro-SemiBold.ttf', weight: '600', style: 'normal' },
  ],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});
