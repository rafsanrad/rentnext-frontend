# RentNest — API Integration

RentNest frontend is integrated with the RentNest backend API for authentication, properties, rental requests, watchlist, payments, reviews, and admin management.

## Base API

```text
/api
```

The frontend communicates with the backend using `fetch`/API helper functions and sends the authentication token through the `Authorization` header when required.

---

## Authentication

| Frontend Page    | Method | Backend Endpoint     | Purpose                        |
| ---------------- | ------ | -------------------- | ------------------------------ |
| Login            | POST   | `/api/auth/login`    | User login                     |
| Register         | POST   | `/api/auth/register` | Create tenant/landlord account |
| Tenant Dashboard | GET    | `/api/auth/me`       | Get logged-in user             |
| Logout           | POST   | `/api/auth/logout`   | Clear authentication session   |

---

## Properties

| Frontend Page      | Method | Backend Endpoint      | Purpose                           |
| ------------------ | ------ | --------------------- | --------------------------------- |
| Properties Page    | GET    | `/api/properties`     | Get properties with search/filter |
| Property Details   | GET    | `/api/properties/:id` | Get property details              |
| Landlord Dashboard | POST   | `/api/properties`     | Add property                      |
| Landlord Dashboard | PATCH  | `/api/properties/:id` | Update property                   |
| Landlord Dashboard | DELETE | `/api/properties/:id` | Delete property                   |

---

## Categories

| Frontend Page   | Method | Backend Endpoint  | Purpose                  |
| --------------- | ------ | ----------------- | ------------------------ |
| Properties Page | GET    | `/api/categories` | Load property categories |

Category filtering is performed using the category ID with the properties API.

---

## Watchlist

| Frontend Page    | Method | Backend Endpoint             | Purpose                   |
| ---------------- | ------ | ---------------------------- | ------------------------- |
| Property Details | GET    | `/api/watchlist`             | Get user's watchlist      |
| Property Details | POST   | `/api/watchlist`             | Add property to watchlist |
| Property Details | DELETE | `/api/watchlist/:propertyId` | Remove property           |
| Tenant Dashboard | GET    | `/api/watchlist`             | Display saved properties  |
| Tenant Dashboard | DELETE | `/api/watchlist/:propertyId` | Remove saved property     |

---

## Rental Requests

| Frontend Page      | Method | Backend Endpoint                  | Purpose                |
| ------------------ | ------ | --------------------------------- | ---------------------- |
| Property Details   | POST   | `/api/rental-requests`            | Submit rental request  |
| Tenant Dashboard   | GET    | `/api/rental-requests/my`         | View tenant requests   |
| Tenant Dashboard   | PATCH  | `/api/rental-requests/:id/cancel` | Cancel rental request  |
| Landlord Dashboard | GET    | `/api/rental-requests/landlord`   | View landlord requests |
| Landlord Dashboard | PATCH  | `/api/rental-requests/:id/status` | Approve/reject request |

---

## Payments

| Frontend Page    | Method | Backend Endpoint                        | Purpose                         |
| ---------------- | ------ | --------------------------------------- | ------------------------------- |
| Tenant Dashboard | POST   | `/api/payments/create-checkout-session` | Create Stripe Checkout session  |
| Payment Success  | GET    | `/api/payments/...`                     | Display successful payment flow |
| Payment Cancel   | GET    | —                                       | Handle cancelled checkout       |

### Payment Provider

```text
Stripe
```

The frontend redirects the tenant to Stripe Checkout after an approved rental request. After payment, the user is redirected to the success or cancel page.

---

## Reviews

| Frontend Page    | Method | Backend Endpoint | Purpose                |
| ---------------- | ------ | ---------------- | ---------------------- |
| Tenant Dashboard | POST   | `/api/reviews`   | Submit property review |

Reviews are submitted after completing the required rental/payment flow.

---

## Admin

All admin endpoints require authentication and the `ADMIN` role.

| Frontend Page   | Method | Backend Endpoint                   | Purpose                   |
| --------------- | ------ | ---------------------------------- | ------------------------- |
| Admin Dashboard | GET    | `/api/admin/stats`                 | Dashboard statistics      |
| Admin Dashboard | GET    | `/api/admin/users`                 | Manage users              |
| Admin Dashboard | PATCH  | `/api/admin/users/:id/ban`         | Ban user                  |
| Admin Dashboard | PATCH  | `/api/admin/users/:id/unban`       | Unban user                |
| Admin Dashboard | GET    | `/api/admin/properties`            | Manage properties         |
| Admin Dashboard | PATCH  | `/api/admin/properties/:id/status` | Update property status    |
| Admin Dashboard | GET    | `/api/admin/rental-requests`       | View rental requests      |
| Admin Dashboard | GET    | `/api/admin/payments`              | View payments and revenue |

---

## Error Handling

The frontend handles API failures using:

* Loading states
* Error states
* Empty states
* User-friendly error messages
* Form validation feedback
* Toast/inline feedback where applicable
* Authentication redirects for unauthorized requests

---

## Main Frontend → Backend Flow

```text
Tenant
  ↓
Login
  ↓
Browse & Filter Properties
  ↓
Property Details
  ↓
Add to Watchlist
  ↓
Request to Rent
  ↓
Landlord Approval
  ↓
Stripe Checkout
  ↓
Payment Success
  ↓
Active Rental
  ↓
Review
  ↓
Completed Rental
```

The frontend consumes the backend APIs throughout the complete rental lifecycle.
