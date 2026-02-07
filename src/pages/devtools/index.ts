import Browser from 'webextension-polyfill';

Browser
  .devtools
  .panels
  .create('Dev Tools', 'project logo.svg', 'src/pages/devtools/index.html')
  .catch(console.error);
