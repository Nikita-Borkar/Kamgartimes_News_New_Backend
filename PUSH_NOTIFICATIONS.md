# Browser push notifications setup

The reader website registers `/sw.js`, requests browser permission, and saves its Web Push subscription through `/api/v1/public/push/subscribe`. MongoDB stores subscriptions. The backend sends a push when an article changes from `DRAFT` to `PUBLISHED` through the existing admin publish endpoint. Failed delivery does not block publishing, and expired subscriptions are removed.

## Required backend environment

Generate a VAPID key pair in a trusted environment:

```sh
npx web-push generate-vapid-keys
```

Set these values in the backend deployment environment (never expose the private key to the browser):

```env
VAPID_PUBLIC_KEY=<generated public key>
VAPID_PRIVATE_KEY=<generated private key>
VAPID_SUBJECT=mailto:admin@example.com
WEBSITE_URL=https://your-reader-site.example
```

The reader site must use HTTPS in production (localhost is suitable for local development), and the backend CORS configuration must allow its origin. Deploy the frontend service worker and backend together before collecting subscriptions. Existing browser permission grants from the old placeholder do not create a push subscription; readers must subscribe again.

The current behavior notifies every active subscriber for every newly published article. Updating an already published article does not send another notification.
