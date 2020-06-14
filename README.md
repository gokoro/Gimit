# Gimit

The tool written with Node.js to download files from shared link.

## Installation

Install dependencies by one of these commands:

```bash
npm install
```
```bash
yarn
```

## How to use

1. At first, you need to get ``credentials.json`` file from [here](https://developers.google.com/drive/api/v3/quickstart/nodejs#step_1_turn_on_the), and replace the file in this directory.
2. Set the json url that contains gdrive link into ``index.js``.
3. Set the type of file you will download.

So, you need to edit these variables in ``index.js``

```js
const baseURL = ''
const fileType = 'rar'
```