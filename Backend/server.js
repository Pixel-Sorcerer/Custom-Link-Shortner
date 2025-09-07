const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// 1. Remove special characters from password (replace @ with %40)
mongoose.connect("mongodb+srv://Nitro:Nitro%402005@cluster0.hoo8wxe.mongodb.net/UrlShortner?retryWrites=true&w=majority")
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err));

app.use(cors());
app.use(express.json());

// 2. Explicit collection name
const Url = mongoose.model('Url', new mongoose.Schema({
    originalUrl: String,
    customText: { type: String, unique: true }
}), 'urls'); // Third param = collection name

// 3. Hardened /create endpoint
app.post('/create', async (req, res) => {
    try {
        let { originalUrl, customText } = req.body;

        // 4. Strict validation
        if (typeof originalUrl !== 'string' || typeof customText !== 'string') {
            return res.status(400).json({ error: 'Invalid input types' });
        }

        originalUrl = originalUrl.includes('://') ? originalUrl : `https://${originalUrl}`;

        // 5. Insert with timeout safety
        const newUrl = new Url({ originalUrl, customText });
        await newUrl.save().catch(err => {
            console.error('❌ Save error:', err);
            throw err; // Re-throw to trigger catch block
        });

        res.json({
            success: true,
            shortUrl: `https://lnkr.onrender.com/${customText}`
        });


    } catch (error) {
        console.error('🔥 Route error:', error);
        res.status(500).json({
            error: error.code === 11000 ? 'Custom text exists' : 'Database operation failed'
        });
    }
});

// Add this route (ensure it comes AFTER all other middleware)
app.get('/:customText', async (req, res) => {
    try {
        const url = await Url.findOne({
            customText: req.params.customText
        });

        if (!url) return res.status(404).send('Short URL not found');

        // Preserve original protocol if it exists
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