const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert(require('./src/modules/notification/firebase.config.json')),
  databaseURL: 'https://webfinalproject-ef3ea-default-rtdb.firebaseio.com'
});

admin.database().setRules('{ "rules": { ".read": true, ".write": true } }')
  .then(() => {
    console.log('Rules updated successfully!');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
