clientID 01JNCXQG2JYCC8B7JW09QWE8BC
Client Secret: 445e7a6136aea58ebe258660eabce8848104d0f2ec26873c19013b0e0bdc8a71
//redirect http://localhost:3002/
curl -X POST https://kick.com/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "client_credentials",
    "client_id": "01JNCXQG2JYCC8B7JW09QWE8BC",
    "client_secret": "445e7a6136aea58ebe258660eabce8848104d0f2ec26873c19013b0e0bdc8a71"
  }'