// The JSON list that contains the gdrive url must be here.
// For example: https://example.com/download.json
const baseURL = ''
const fileType = 'rar'

const axios = require('axios')
const fs = require('fs')
const readline = require('readline');
const {google} = require('googleapis');

const fetchData = async data => {
    for (let i = 0, l = data.length; i < l; i++) {
        try {
            const id = data[i].split('id=')[1]
            console.log(i + '. ' + id)
            await gdDownload(i, id)
        } catch (err) {}
    }
}
const gdDownload = (i, id) => {
  return new Promise((resolve, reject) => {
    authorize(authKey, auth => {
        const drive = google.drive({ version: 'v3', auth })
        let dest = fs.createWriteStream(`./download/${i}. ${id}.${fileType}`); // The type of file is set as .rar now.

        drive.files.get({fileId: id, alt: 'media'}, {responseType: 'stream'}, function (err, res) {
          try {
            res.data
            .on('end', () => {
               console.log('Done');
               resolve('done')                  
            })
            .on('error', err => {
               console.log('Error', err);
               resolve('done')                  
            })
            .pipe(dest);
          } catch (error) {
            resolve('done')                  
          }
        })
    })
  })
}

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const TOKEN_PATH = 'token.json';

let authKey = ''

fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authKey = JSON.parse(content)
  authorize(JSON.parse(content), listFiles);
});

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  });
}


axios.get(baseURL)
  .then(res => res.data)
  .then(data => fetchData(data))