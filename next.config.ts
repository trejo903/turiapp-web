/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary
      { protocol: 'https', hostname: 'res.cloudinary.com' },

      // AWS S3 (tu bucket de imágenes)
      { protocol: 'https', hostname: 'amzn--image.s3.us-east-2.amazonaws.com' },

      // si usas http/https en local
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'localhost' },

      // otros CDNs que uses
      // { protocol: 'https', hostname: 'images.unsplash.com' },
      // { protocol: 'https', hostname: 'cdn.tudominio.com' },
    ],
  },
};

module.exports = nextConfig;
