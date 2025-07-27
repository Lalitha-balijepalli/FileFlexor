import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve React app
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Ensure uploads and processed directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const processedDir = path.join(__dirname, 'processed');

try {
  await fs.access(uploadsDir);
} catch {
  await fs.mkdir(uploadsDir, { recursive: true });
}

try {
  await fs.access(processedDir);
} catch {
  await fs.mkdir(processedDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, PPTX, JPG, and PNG files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Helper function to get file size
const getFileSize = async (filePath) => {
  const stats = await fs.stat(filePath);
  return stats.size;
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileSize = await getFileSize(req.file.path);

    res.json({
      success: true,
      file: {
        id: req.file.filename,
        originalName: req.file.originalname,
        size: fileSize,
        formattedSize: formatFileSize(fileSize),
        type: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Process endpoint
app.post('/api/process', async (req, res) => {
  try {
    const { fileId, operation, targetFormat, quality = 80 } = req.body;

    if (!fileId || !operation) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const inputPath = path.join(uploadsDir, fileId);
    
    // Check if file exists
    try {
      await fs.access(inputPath);
    } catch {
      return res.status(404).json({ error: 'File not found' });
    }

    const fileExt = path.extname(fileId).toLowerCase();
    const baseName = path.basename(fileId, fileExt);
    let outputPath;
    let outputExt;

    if (operation === 'compress') {
      outputExt = fileExt;
      outputPath = path.join(processedDir, `${baseName}_compressed${outputExt}`);

      if (['.jpg', '.jpeg', '.png'].includes(fileExt)) {
        await sharp(inputPath)
          .jpeg({ quality: Math.max(20, Math.min(100, quality)) })
          .toFile(outputPath);
      } else if (fileExt === '.pdf') {
        // For PDF compression, we'll copy for now (basic implementation)
        // In a real app, you'd use pdf-lib or similar for actual compression
        const pdfData = await fs.readFile(inputPath);
        const pdfDoc = await PDFDocument.load(pdfData);
        const compressedPdfBytes = await pdfDoc.save();
        await fs.writeFile(outputPath, compressedPdfBytes);
      } else {
        return res.status(400).json({ error: 'Compression not supported for this file type' });
      }
    } else if (operation === 'convert') {
      if (!targetFormat) {
        return res.status(400).json({ error: 'Target format required for conversion' });
      }

      outputExt = `.${targetFormat}`;
      outputPath = path.join(processedDir, `${baseName}_converted${outputExt}`);

      if (['.jpg', '.jpeg', '.png'].includes(fileExt)) {
        if (targetFormat === 'webp') {
          await sharp(inputPath).webp({ quality }).toFile(outputPath);
        } else if (targetFormat === 'pdf') {
          // Convert image to PDF
          const imageBuffer = await fs.readFile(inputPath);
          const image = sharp(imageBuffer);
          const metadata = await image.metadata();
          
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([metadata.width || 800, metadata.height || 600]);
          
          let embedImage;
          if (fileExt === '.png') {
            embedImage = await pdfDoc.embedPng(imageBuffer);
          } else {
            embedImage = await pdfDoc.embedJpg(imageBuffer);
          }
          
          page.drawImage(embedImage, {
            x: 0,
            y: 0,
            width: metadata.width || 800,
            height: metadata.height || 600,
          });
          
          const pdfBytes = await pdfDoc.save();
          await fs.writeFile(outputPath, pdfBytes);
        }
      } else {
        return res.status(400).json({ error: 'Conversion not supported for this file type combination' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid operation' });
    }

    const outputSize = await getFileSize(outputPath);
    const outputFileName = path.basename(outputPath);

    // Clean up original file
    setTimeout(async () => {
      try {
        await fs.unlink(inputPath);
      } catch (error) {
        console.error('Error cleaning up original file:', error);
      }
    }, 1000);

    res.json({
      success: true,
      result: {
        filename: outputFileName,
        size: outputSize,
        formattedSize: formatFileSize(outputSize),
        downloadUrl: `/api/download/${outputFileName}`
      }
    });
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: error.message || 'Processing failed' });
  }
});

// Download endpoint
app.get('/api/download/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(processedDir, filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Stream the file
    const fileStream = await fs.readFile(filePath);
    res.send(fileStream);

    // Clean up processed file after download
    setTimeout(async () => {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error cleaning up processed file:', error);
      }
    }, 5000);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`FileFlexor server running on port ${PORT}`);
});