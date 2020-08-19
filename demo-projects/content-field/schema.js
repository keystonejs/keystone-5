require('dotenv').config();
const { OEmbed, IframelyOEmbedAdapter } = require('@keystonejs/fields-oembed');
const { CloudinaryImage } = require('@keystonejs/fields-cloudinary-image');
const { Unsplash } = require('@keystonejs/fields-unsplash');
const { Content } = require('@keystonejs/fields-content');
const { CloudinaryAdapter } = require('@keystonejs/file-adapters');

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } = process.env;

const cloudinaryAdapter = new CloudinaryAdapter({
  cloudName: CLOUDINARY_CLOUD_NAME,
  apiKey: CLOUDINARY_KEY,
  apiSecret: CLOUDINARY_SECRET,
});

const iframelyAdapter = new IframelyOEmbedAdapter({
  apiKey: process.env.IFRAMELY_API_KEY,
});

exports.Post = {
  fields: {
    // unsplash: {
    //   type: Unsplash,
    //   attribution: 'vocal.media',
    //   accessKey: process.env.UNSPLASH_ACCESS_KEY,
    //   secretKey: process.env.UNSPLASH_SECRET_KEY,
    // },
    // coloudinary: { type: CloudinaryImage, adapter: cloudinaryAdapter },
    body: {
      type: Content,
      blocks: [
        [CloudinaryImage.blocks.image, { adapter: cloudinaryAdapter }],
        [
          Unsplash.blocks.unsplashImage,
          {
            attribution: 'vocal.media',
            accessKey: process.env.UNSPLASH_ACCESS_KEY,
            secretKey: process.env.UNSPLASH_SECRET_KEY,
          },
        ],
        [OEmbed.blocks.oEmbed, { adapter: iframelyAdapter }],
        Content.blocks.blockquote,
        Content.blocks.orderedList,
        Content.blocks.unorderedList,
        Content.blocks.link,
        Content.blocks.heading,
      ],
    },
  },
};
