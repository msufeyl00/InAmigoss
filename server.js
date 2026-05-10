const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'donations');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}_${originalName}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
    }
  }
});

// Handle donation submissions
app.post('/api/donate', upload.single('screenshot'), (req, res) => {
  try {
    const { name, email, amount, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !amount || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create a JSON record for this donation
    const donation = {
      id: Date.now(),
      date: new Date().toISOString(),
      name: name,
      email: email,
      amount: amount,
      message: message || '',
      screenshot: req.file.filename,
      screenshotPath: `/donations/${req.file.filename}`,
      originalFileName: req.file.originalname
    };

    // Save to donations.json
    const donationsFile = path.join(uploadsDir, 'donations.json');
    let donations = [];
    
    if (fs.existsSync(donationsFile)) {
      const data = fs.readFileSync(donationsFile, 'utf-8');
      donations = JSON.parse(data);
    }
    
    donations.push(donation);
    fs.writeFileSync(donationsFile, JSON.stringify(donations, null, 2));

    console.log(`✅ New donation received from ${name} for ₹${amount}`);

    res.status(200).json({
      success: true,
      message: 'Thank you for your generous donation! We have received your screenshot and will process it shortly.',
      donation: donation
    });
  } catch (error) {
    console.error('Error processing donation:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing donation: ' + error.message
    });
  }
});

// API to get all donations (for admin/dashboard)
app.get('/api/donations', (req, res) => {
  try {
    const donationsFile = path.join(uploadsDir, 'donations.json');
    if (fs.existsSync(donationsFile)) {
      const data = fs.readFileSync(donationsFile, 'utf-8');
      const donations = JSON.parse(data);
      res.json({
        success: true,
        total: donations.length,
        donations: donations
      });
    } else {
      res.json({
        success: true,
        total: 0,
        donations: []
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving donations: ' + error.message
    });
  }
});

// Serve donation files
app.use('/donations', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    uploadsDir: uploadsDir,
    time: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║      🎉 InAmigos Donation System Server Running 🎉         ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  🌐 Local URL: http://localhost:${PORT}                   ║
║  📁 Uploads folder: ${uploadsDir}
║                                                            ║
║  📊 View all donations: http://localhost:${PORT}/api/donations
║  ✅ Server health: http://localhost:${PORT}/api/health    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});
