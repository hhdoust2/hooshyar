پوشه‌ی vendor (اختیاری) — برای خواندن فایل‌های PDF و Word بدون وابستگی به CDN

این سه فایل را دانلود کنید و با همین نام‌ها در همین پوشه (vendor) بگذارید، کنار index.html:

1) vendor/pdf.min.js
   https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js

2) vendor/pdf.worker.min.js
   https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js

3) vendor/mammoth.browser.min.js
   https://cdn.jsdelivr.net/npm/mammoth@1.4.9/mammoth.browser.min.js

نکته‌ها:
- هر دو فایل pdf لازم‌اند (pdf.min.js و pdf.worker.min.js).
- اگر این پوشه نباشد، برنامه خودش همین کتابخانه‌ها را از cdn.jsdelivr.net بارگذاری می‌کند.
- نسخه‌ی pdf.js باید همان 3.11.174 باشد (نسخه‌های جدیدتر ساختار متفاوتی دارند).
- ساختار نهایی مخزن:
    index.html
    vercel.json
    api/groq.js
    vendor/pdf.min.js
    vendor/pdf.worker.min.js
    vendor/mammoth.browser.min.js
