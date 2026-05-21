# Security Specification for Money Tracker MM

## Data Invariants
1. A transaction must belong to the authenticated user.
2. Fees must be non-negative.
3. Amounts must be positive numbers.
4. Transaction dates must be valid strings.
5. Settings can only be modified by the owner.

## The "Dirty Dozen" Payloads
1. **Unauthorized Settings Write**: Attempting to write to `/users/anotherUser/settings/info`.
2. **Identity Spoofing**: Creating a transaction with `userId` set to a different user's ID.
3. **Invalid Type**: Setting `type` to something other than "in" or "out".
4. **Invalid Category**: Setting `category` to "PayPal" or something not whitelisted.
5. **Negative Amount**: Setting `amount: -100`.
6. **Negative Fee**: Setting `fee: -5`.
7. **Resource Poisoning (ID)**: Creating a transaction with a 2KB document ID.
8. **Shadow Field injection**: Adding `isAdmin: true` to the settings document.
9. **Update Gap**: Changing the `userId` of an existing transaction document.
10. **Timestamp Spoofing**: Sending a manual `createdAt` string instead of a server timestamp during creation of a transaction.
11. **Settings Breach**: Reading another user's settings.
12. **Transaction Scraping**: Listing another user's transactions.

## Test Runner Plan
I will implement `firestore.rules` that block these. I'll use the `isValid[Entity]` pattern.
