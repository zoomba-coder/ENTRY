ENTRY — V4 ONLINE SETUP

The V4 interface is preserved.

For local testing, the app can run with Node.js using: npm start

For the shared FRIENDS version, deploy this folder as a Node Web Service and connect the submission API to persistent hosted storage. The current server uses entry-data.json for local testing only; do not rely on that file for persistent production data on hosts with ephemeral filesystems.

Recommended production setup: hosted Node web service + hosted Postgres/database. Keep the admin key private as an environment variable named ENTRY_ADMIN_KEY.
