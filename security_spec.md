# Security Specification: Cyra Bites Firebase Security

## 1. Data Invariants
- Each user profile document `/users/{uid}` can only be read or written by the authenticated owner (`request.auth.uid == uid`).
- Users are strictly forbidden from changing sensitive administrative metrics, spoofing identities, or injecting arbitrary payloads.
- Address records inside `/users/{uid}/addresses/{addressId}` are private and restricted to the owner (`uid`).
- Order history records inside `/users/{uid}/orders/{orderId}` are private to the buyer as well, with no blanket reads allowed.

## 2. The "Dirty Dozen" Rogues (Payloads designed to break integrity)
1. **Unauthenticated User Profile Creation**: Creating a profile without signing in.
2. **User Identity Spoofing**: Attempting to write a profile document where `uid` does not match the authenticated session's `uid`.
3. **Blanket Addresses Harvesting**: Attempting to query or read all users' address locations.
4. **Foreign Address Hijacking / Tampering**: Editing an address in another user's subcollection.
5. **Unauthorized Status Escalation**: Maliciously updating an Order status to "Delivered" from the client side without proper authorization.
6. **Denial-of-Wallet Character Injection**: Creating an address with a labels or fields exceeding 100kb sizes.
7. **Privileged Fields Manipulation**: Attempting to arbitrarily increase user rewards points.
8. **Forged Timestamp Injection**: Attempting to set standard timeline timestamps to future / false client clocks instead of `request.time`.
9. **Fake ID Injection**: Attempting to create documents with non-standard long strings or invalid symbols.
10. **Foreign List Order Reading**: Querying another user's private orders list.
11. **Shadow Key Inoculation**: Adding unapproved ghost parameters (e.g. `isAdmin: true` or `isPremium`) into user profile.
12. **Malformed Enum Value**: Setting an invalid string value for order status.

## 3. The Test Setup
To achieve maximum isolation, all queries must be run authenticated with the user's explicit token containing verified markers.
Our Firestore Security rules will handle validation of all these.
