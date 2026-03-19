# MongoDB Collections

This project now stores data in MongoDB instead of MySQL.

Default collections:

- `loan_applications`
- `loan_application_api_logs`
- `contact_messages`
- `do_not_sell_requests`
- `us_zip_lookup`

Recommended indexes:

```javascript
db.loan_applications.createIndex({ createdAt: -1 });
db.loan_application_api_logs.createIndex({ applicationId: 1, createdAt: -1 });
db.contact_messages.createIndex({ createdAt: -1 });
db.do_not_sell_requests.createIndex({ createdAt: -1 });
db.us_zip_lookup.createIndex({ zip: 1, country: 1 });
```

Expected ZIP lookup document shape:

```json
{
  "zip": "10001",
  "city": "New York",
  "state": "NY",
  "country": "United States"
}
```
