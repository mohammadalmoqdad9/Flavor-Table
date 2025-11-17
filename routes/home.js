const express = require('express');
const path = require('path');
const router = express.Router();

// (أ) Home Endpoint (/)
router.get('/', (req, res) => {
    // process.cwd() يُرجع المسار الذي بدأت منه تشغيل الخادم (أي مجلد Flavor-Table)
    // هذا المسار لا يتأثر بمكان وجود ملف home.js داخل مجلد routes
    const projectRoot = process.cwd();
    
    // بناء المسار المطلق لملف index.html
    const filePath = path.join(projectRoot, 'public', 'index.html');
    
    // console.log("Final Path Check:", filePath); // يمكنك إزالة هذا السطر بعد التأكد من عمله
    
    res.sendFile(filePath);
});

module.exports = router;