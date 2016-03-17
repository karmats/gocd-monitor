# go.cd monitor
Build monitor for gocd build server https://www.go.cd/


## Setup
Open app-config.js and change the three lines
```   
// Url for your go server
goServerUrl: 'https://ci.example.com',
// Go user to use for communication with go server
goUser: 'xxx',
// Password for go user
goPassword: 'xxx',
  ```
Open a terminal and enter
```
npm install
npm start
```
Open `http://localhost:3000`

Enjoy :)

## Development
To run the application in development mode, open a terminal and enter `npm run dev-start`. The server and client will be rebuilt when a js or jsx-file changes.
