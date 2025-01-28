/**
 * TweetCopy
 * 
 * @name        XtraCopy
 * @description Copy tweet text and image URLs by clicking a button. Simple.
 * @link        https://github.com/xoraus/XtraCopy
 * @author      xoraus
 * @authorLink  https://xoruas.github.io/
 * @version     1.1.0
 * @created     Jan 28, 2025
 * @updated     Jan 28, 2025
 * @copyright   Copyright (C) 2025, Sajjad Salaria
 * @license     Dual licensed under the MIT and GPL licenses
 * @licenseMIT  http://www.opensource.org/licenses/mit-license.php
 * @licenseGPL  http://www.opensource.org/licenses/gpl-3.0.html
 *      
 */

/**
 * Copies the provided text to the clipboard. If the modern Clipboard API is unavailable, it falls back to using a temporary textarea.
 * 
 * @param {string} text - The text to be copied to the clipboard.
 * @returns {Promise<boolean>} - Resolves to true if the text was successfully copied, otherwise false.
 */
const copyToClipboard = (text) => {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  } else {
    const textarea = document.createElement("textarea");
    textarea.textContent = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
};

/**
 * Extracts image URLs from a tweet.
 * 
 * @param {Element} tweet - The tweet element.
 * @returns {string[]} - An array of image URLs.
 */
const extractImageUrls = (tweet) => {
  const images = tweet.querySelectorAll('img[alt="Image"]');
  return Array.from(images).map(img => img.src);
};

/**
 * Adds a copy button to tweets in the Twitter UI. The button allows users to copy the tweet text, author handle, and image URLs.
 */
const addCopyButtonToTweets = () => {
  // Select all tweet articles
  const tweets = document.querySelectorAll('article[role="article"]');

  tweets.forEach((tweet) => {
    // Skip if the copy button is already added
    if (tweet.querySelector(".copy-button")) return;

    // Locate the bookmark button in the tweet
    const bookmarkButton = tweet.querySelector('[data-testid="bookmark"]');

    if (bookmarkButton) {
      // Create the copy button
      const copyButton = document.createElement("button");
      copyButton.className = "copy-button";
      copyButton.innerHTML = "📋"; // Icon for the button

      // Copy the tweet text and image URLs when the button is clicked
      copyButton.addEventListener("click", (e) => {
        e.stopPropagation();
        

        // Retrieve the tweet text
        const tweetText = tweet.querySelector('[data-testid="tweetText"]')?.innerText;
        const authorHandle = tweet.querySelector('a[tabindex="-1"] span')?.innerText;

        if (tweetText) {
          const fullTweet = `${tweetText} — ${authorHandle}`;
          const imageUrls = extractImageUrls(tweet);
          const fullContent = imageUrls.length > 0 ? `${fullTweet}\n\nImages:\n![](${imageUrls.join('\n')})` : fullTweet;

          if (copyToClipboard(fullContent)) {
            // Provide temporary success feedback
            copyButton.textContent = "✅";
            setTimeout(() => (copyButton.textContent = "📋"), 2000);
          } else {
            alert("Failed to copy the tweet!");
          }
        }
      });

      // Insert the copy button next to the bookmark button
      bookmarkButton.parentElement.insertBefore(copyButton, bookmarkButton.nextSibling);
    }
  });
};

/**
 * Observes DOM changes and dynamically adds copy buttons to tweets as they are loaded.
 */
const observer = new MutationObserver(() => addCopyButtonToTweets());
observer.observe(document.body, { childList: true, subtree: true });