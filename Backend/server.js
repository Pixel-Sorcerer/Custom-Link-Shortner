const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// 1. Connect to MongoDB
mongoose.connect("mongodb+srv://Nitro:Nitro%402005@cluster0.hoo8wxe.mongodb.net/UrlShortner?retryWrites=true&w=majority")
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err));

app.use(cors());
app.use(express.json());

// 2. Schema with compound index (originalUrl + customText must be unique together)
const urlSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    customText: { type: String, required: true }
});

// Compound unique index
urlSchema.index({ originalUrl: 1, customText: 1 }, { unique: true });

const Url = mongoose.model('Url', urlSchema, 'urls');

// 3. /create endpoint
app.post('/create', async (req, res) => {
    try {
        let { originalUrl, customText } = req.body;

        // Strict validation
        if (typeof originalUrl !== 'string' || typeof customText !== 'string') {
            return res.status(400).json({ error: 'Invalid input types' });
        }

        // Ensure URL has protocol
        originalUrl = originalUrl.includes('://') ? originalUrl : `https://${originalUrl}`;

        // Save new mapping
        const newUrl = new Url({ originalUrl, customText });
        await newUrl.save();

        res.json({
            success: true,
            shortUrl: `https://lnkr.onrender.com/${customText}`
        });

    } catch (error) {
        console.error('🔥 Route error:', error);
        res.status(500).json({
            error: error.code === 11000 ? 'This custom text is already in use for this URL' : 'Database operation failed'
        });
    }
});

// 4. Redirect endpoint
app.get('/:customText', async (req, res) => {
    try {
        const url = await Url.findOne({ customText: req.params.customText });

        if (!url) return res.status(404).send('Short URL not found');

        let redirectUrl = url.originalUrl;
        if (!/^https?:\/\//i.test(redirectUrl)) {
            redirectUrl = 'https://' + redirectUrl;
        }

        res.redirect(redirectUrl);

    } catch (error) {
        console.error('Redirect error:', error);
        res.status(500).send('Server error');
    }
});

app.listen(3001, () => console.log('🚀 Server running on 3001'));
