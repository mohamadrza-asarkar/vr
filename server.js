const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('basic-auth');

const app = express();
const PORT = process.env.PORT || 3000;

// تنظیمات Multer برای آپلود عکس‌ها
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const imgDir = path.join(__dirname, 'public/img'); // تغییر به img
    if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir, { recursive: true });
    }
    cb(null, imgDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Middleware برای سرویس فایل‌های استاتیک
app.use(express.static(path.join(__dirname, 'public')));

// احراز هویت برای صفحه ادمین
const authenticate = (req, res, next) => {
  const user = auth(req);
  if (!user || user.name !== process.env.ADMIN_USERNAME || user.pass !== process.env.ADMIN_PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="Admin Panel"');
    return res.status(401).send('دسترسی غیرمجاز');
  }
  next();
};

// روت برای آپلود عکس‌ها
app.post('/upload', upload.array('images', 10), (req, res) => {
  res.send('عکس‌ها با موفقیت آپلود شدند!');
});

// روت برای دریافت لیست عکس‌ها
app.get('/images', (req, res) => {
  const imgDir = path.join(__dirname, 'public/img'); // تغییر به img
  fs.readdir(imgDir, (err, files) => {
    if (err) {
      return res.status(500).send('خطا در خواندن عکس‌ها.');
    }
    // فیلتر کردن فقط فایل‌های تصویری
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
    res.json(imageFiles);
  });
});

// اعمال احراز هویت برای صفحه ادمین
app.use('/admin.html', authenticate);

// راه‌اندازی سرور
app.listen(PORT, () => {
  console.log(`سرور در حال اجرا است: http://localhost:${PORT}`);
});