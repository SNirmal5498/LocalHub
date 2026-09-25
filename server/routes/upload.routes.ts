import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Upload image (Cloudinary or Base64 data URL)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { image, folder = 'localhub' } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: 'Image data or URL is required.' });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      try {
        // Upload to Cloudinary via REST API
        const timestamp = Math.round(new Date().getTime() / 1000);
        const crypto = await import('crypto');
        const signature = crypto
          .createHash('sha1')
          .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
          .digest('hex');

        const formData = new URLSearchParams();
        formData.append('file', image);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadData.secure_url) {
          return res.json({
            success: true,
            data: {
              url: uploadData.secure_url,
              provider: 'cloudinary',
            },
          });
        } else {
          console.warn('[Upload] Cloudinary upload returned error:', uploadData);
        }
      } catch (cloudErr: any) {
        console.error('[Upload] Cloudinary error:', cloudErr);
      }
    }

    // If Cloudinary is not configured, notify via headers/response while allowing data URL
    return res.json({
      success: true,
      data: {
        url: image,
        provider: 'local_data_url',
      },
      message: cloudName
        ? 'Image processed.'
        : 'Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured. Storing image as direct asset URL.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
