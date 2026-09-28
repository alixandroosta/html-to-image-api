import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('URL parameter is required');
  }

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1000, height: 900 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    // الانتقال للرابط وانتظار انتهاء الطلبات الشبكية
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });

    // انتظار ثانية إضافية للتأكد من معالجة الـ JS والمتغيرات
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // التقاط الصورة بصيغة JPG
    const imageBuffer = await page.screenshot({ type: 'jpeg', quality: 90 });

    await browser.close();

    // إرجاع الصورة مباشرة
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(imageBuffer);

  } catch (error) {
    return res.status(500).send(error.message);
  }
}