const axios = require("axios");

/**
 * Fetch YouTube video metadata using oEmbed API (no API key required)
 * @param {Object} req - Express request with url in body
 * @param {Object} res - Express response
 */
exports.fetchYouTubeMetadata = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "YouTube URL is required" });
    }

    // Validate YouTube URL format
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]+/;
    if (!youtubeRegex.test(url)) {
      return res.status(400).json({ error: "Invalid YouTube URL format" });
    }

    // Extract video ID
    let videoId = null;
    const urlObj = new URL(url);

    if (urlObj.hostname.includes("youtu.be")) {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.searchParams.has("v")) {
      videoId = urlObj.searchParams.get("v");
    } else if (urlObj.pathname.includes("/embed/")) {
      videoId = urlObj.pathname.split("/embed/")[1];
    } else if (urlObj.pathname.includes("/shorts/")) {
      videoId = urlObj.pathname.split("/shorts/")[1];
    }

    if (!videoId) {
      return res
        .status(400)
        .json({ error: "Could not extract video ID from URL" });
    }

    // Clean video ID (remove any extra parameters)
    videoId = videoId.split("?")[0].split("&")[0];

    // Fetch metadata using YouTube oEmbed API (free, no key needed)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    const response = await axios.get(oembedUrl);

    const metadata = {
      videoId,
      title: response.data.title,
      author: response.data.author_name,
      authorUrl: response.data.author_url,
      thumbnailUrl: response.data.thumbnail_url,
      html: response.data.html,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };

    res.json(metadata);
  } catch (error) {
    console.error("YouTube metadata fetch error:", error.message);

    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(404).json({ error: "Video not found or is private" });
    }

    res.status(500).json({ error: "Failed to fetch YouTube metadata" });
  }
};
