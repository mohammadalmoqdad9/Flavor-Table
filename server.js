// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path'); // نحتاجه فقط لتحديد مسار الملفات الثابتة

// Import the routers مباشرةً
const homeRouter = require('./routes/home'); 
const recipesRouter = require('./routes/recipes'); 

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Setup
app.use(cors()); 
app.use(express.json()); 

// تقديم الملفات الثابتة (Public)
// __dirname هو المسار المطلق لمجلد 'Flavor-Table'
app.use(express.static(path.join(__dirname, 'public'))); 

// API Route Handling
// استخدام الراوتر (يجب أن يكون homeRouter كائن Router وليس دالة)
app.use('/', homeRouter); 
app.use('/recipes', recipesRouter); 
app.use(express.static(path.join(__dirname,'puplic')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});