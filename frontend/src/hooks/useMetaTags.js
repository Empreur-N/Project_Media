import { useEffect } from 'react';

export const useMetaTags = ({ title, description, image, url }) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | LIFE CHANNEL`;
      setMetaTag('og:title', `${title} | LIFE CHANNEL`, true);
      setMetaTag('twitter:title', `${title} | LIFE CHANNEL`);
    }

    if (description) {
      setMetaTag('description', description);
      setMetaTag('og:description', description, true);
      setMetaTag('twitter:description', description);
    }

    if (image) {
      const fullImageUrl = image.startsWith('http') ? image : `https://lifechannel.cd${image}`;
      setMetaTag('og:image', fullImageUrl, true);
      setMetaTag('twitter:image', fullImageUrl);
    }

    if (url) {
      const fullUrl = url.startsWith('http') ? url : `https://lifechannel.cd${url}`;
      setMetaTag('og:url', fullUrl, true);
    }
  }, [title, description, image, url]);
};

function setMetaTag(nameOrProperty, content, isProperty = false) {
  const selector = isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`;
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    if (isProperty) {
      element.setAttribute('property', nameOrProperty);
    } else {
      element.setAttribute('name', nameOrProperty);
    }
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}
