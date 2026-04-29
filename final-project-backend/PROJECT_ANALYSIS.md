# 🚗 Car Import Backend — Full Project Analysis

> **Updated:** March 25, 2026
> **Compile Status:** ✅ Zero TypeScript errors (`npx tsc --noEmit` passes cleanly)
> **Runtime Status:** Server starts on port 4000, connects to MongoDB Atlas
> **Base URL:** `http://localhost:4000`
> **Frontend expected at:** `http://localhost:5173`

---

## 1. PROJECT OVERVIEW

A **complete backend API** for an Algeria-based Chinese car import business. It manages car inventory, brands, car models, categories, customer leads, import documents, and admin reports. Two user roles drive a **landing-page / admin-dashboard** architecture.

**Business flow:** Import cars (primarily Chinese brands) into Algeria → track inventory lifecycle from `In Transit` → `In Stock` → `Reserved` → `Sold` → manage customer inquiries (leads) → generate business reports.

---

## 2. TECH STACK

| Technology             | Version | Purpose                                                 |
| ---------------------- | ------- | ------------------------------------------------------- |
| **Node.js**            | —       | Runtime (ESM modules, `"type": "module"`)               |
| **TypeScript**         | 5.9.3   | Language (strict mode, ES2022 target, NodeNext modules) |
| **Express**            | 5.2.1   | HTTP framework (Express 5)                              |
| **Mongoose**           | 9.2.1   | MongoDB ODM                                             |
| **MongoDB Atlas**      | —       | Cloud database (`final-project`)                        |
| **Zod**                | 4.3.6   | Request body validation (imported as `zod/v4`)          |
| **JWT (jsonwebtoken)** | 9.0.3   | Authentication tokens (7-day expiry)                    |
| **bcrypt**             | 6.0.0   | Password hashing (10 salt rounds)                       |
| **multer**             | 2.1.1   | File uploads (images + PDFs, 5MB limit)                 |
| **helmet**             | 8.1.0   | Security headers                                        |
| **cors**               | 2.8.6   | Cross-origin (allows `http://localhost:5173`)           |
| **morgan**             | 1.10.0  | HTTP logging (dev only)                                 |
| **express-rate-limit** | —       | Rate limiting (auth, public, API tiers)                 |
| **http-status-codes**  | 2.3.0   | Named HTTP status constants                             |
| **tsx**                | 4.21.0  | Dev runner (`tsx watch`)                                |

### Scripts

```json
{
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "start": "node .",
  "typecheck": "tsc --noEmit"
}
```

### Environment Variables (`.env`)

```
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb+srv://cluster0.act8g3p.mongodb.net/?appName=Cluster0
MONGODB_USERNAME=<username>
MONGODB_PASSWORD=<password>
MONGODB_DB_NAME=final-project
JWT_SECRET=<64-char hex>
JWT_EXPIRE=7d
FRONTEND_DOMAIN=http://localhost:5173
```

---

## 3. AUTHENTICATION & AUTHORIZATION

### Roles

| Role    | How Created                                       | Access                                                       |
| ------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `admin` | Seeded via `seed-admin.ts` (cannot self-register) | Full dashboard: CRUD all entities, reports, documents        |
| `user`  | Registers via `POST /api/auth/register`           | Landing page only: view cars/brands/categories, submit leads |

### Admin Credentials (Seeded)

- **Email:** `autoship@gmail.com`
- **Password:** `Admin@5678`

### JWT

- Token sent via `Authorization: Bearer <token>` header
- Payload: `{ userId, name, email, role, iat, exp }`
- Expires in 7 days

### Middleware Chain

1. `protect` — Extracts Bearer token, verifies JWT, fetches user from DB, attaches `req.user`
2. `authorize("admin")` — Checks `req.user.role` against allowed roles
3. `validateBodySchema(schema)` — Validates `req.body` with Zod, replaces `req.body` with parsed data

### Rate Limiting

| Limiter         | Limit          | Applied To                      |
| --------------- | -------------- | ------------------------------- |
| `authLimiter`   | 10 req/15 min  | `POST /login`, `POST /register` |
| `publicLimiter` | 30 req/15 min  | `POST /leads`                   |
| `apiLimiter`    | 100 req/15 min | All `/api/*` routes             |

---

## 4. COMPLETE API ENDPOINT MAP

### Auth (`/api/auth`)

| Method | Path        | Access    | Body / Validation      | Response                   |
| ------ | ----------- | --------- | ---------------------- | -------------------------- |
| POST   | `/register` | Public    | `registerSchema`       | `{ success, token, user }` |
| POST   | `/login`    | Public    | `loginSchema`          | `{ success, token, user }` |
| GET    | `/me`       | Protected | —                      | `{ success, user }`        |
| PUT    | `/password` | Protected | `changePasswordSchema` | `{ success, message }`     |

#### Register — `POST /api/auth/register`

```json
// Request
{
  "name": "John Doe",               // 2-50 chars
  "email": "john@example.com",       // valid email
  "password": "MyPass123",           // 8+ chars, uppercase, lowercase, digit
  "phone": "+213 555 12 34 56"       // Algerian format: +213 XXX XX XX XX
}

// Response (201)
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+213 555 12 34 56",
    "role": "user"
  }
}
```

#### Login — `POST /api/auth/login`

```json
// Request
{
  "email": "john@example.com",
  "password": "MyPass123"
}

// Response (200) — same format as register
```

#### Get Me — `GET /api/auth/me`

```json
// Response (200)
{
  "success": true,
  "user": { "id", "name", "email", "phone", "role" }
}
```

#### Change Password — `PUT /api/auth/password`

```json
// Request
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456"    // same strong password rules
}

// Response (200)
{ "success": true, "message": "Password updated successfully" }
```

---

### Brands (`/api/brands`)

| Method | Path       | Access | Body / Validation   | Description                                          |
| ------ | ---------- | ------ | ------------------- | ---------------------------------------------------- |
| GET    | `/`        | Public | —                   | List brands (filter: `origin`, `isActive`, `sortBy`) |
| GET    | `/popular` | Public | —                   | Top 10 active brands by popularity                   |
| GET    | `/:id`     | Public | —                   | Get single brand                                     |
| POST   | `/`        | Admin  | `createBrandSchema` | Create brand                                         |
| PUT    | `/:id`     | Admin  | `updateBrandSchema` | Update brand                                         |
| DELETE | `/:id`     | Admin  | —                   | Delete brand (blocked if referenced)                 |

#### Query Params for `GET /api/brands`

| Param      | Type    | Example                            |
| ---------- | ------- | ---------------------------------- |
| `origin`   | string  | `?origin=China`                    |
| `isActive` | boolean | `?isActive=true`                   |
| `sortBy`   | string  | `?sortBy=popularity` or `name`     |
| `page`     | number  | `?page=1` (default: 1)             |
| `limit`    | number  | `?limit=10` (default: 10, max: 50) |

#### Create Brand Body

```json
{
  "name": "BYD", // required, auto-uppercased
  "origin": "China", // enum: China|Japan|Germany|France|Korea|USA|Other
  "logo": "https://example.com/byd.png", // optional
  "description": "...", // optional
  "isActive": true, // default: true
  "popularity": 85, // 0-100
  "warrantyYears": 5, // min: 1, default: 3
  "hasLocalServiceCenter": true, // default: false
  "website": "https://byd.com" // optional
}
```

---

### Categories (`/api/categories`)

| Method | Path   | Access | Body / Validation      | Description                                        |
| ------ | ------ | ------ | ---------------------- | -------------------------------------------------- |
| GET    | `/`    | Public | —                      | List categories (sorted by `sortOrder`, paginated) |
| GET    | `/:id` | Public | —                      | Get single category                                |
| POST   | `/`    | Admin  | `createCategorySchema` | Create category                                    |
| PUT    | `/:id` | Admin  | `updateCategorySchema` | Update category                                    |
| DELETE | `/:id` | Admin  | —                      | Delete category (blocked if referenced)            |

#### Create Category Body

```json
{
  "name": "SUV", // required
  "nameAr": "سيارة رباعية", // Arabic name, optional
  "description": "...", // optional
  "icon": "🚙", // optional
  "sortOrder": 1 // default: 0
}
```

---

### Car Models (`/api/models`)

| Method | Path              | Access | Body / Validation      | Description                                                              |
| ------ | ----------------- | ------ | ---------------------- | ------------------------------------------------------------------------ |
| GET    | `/`               | Public | —                      | List models (filter: `brand`, `category`, `year`, `isActive`, paginated) |
| GET    | `/years`          | Public | —                      | Distinct model years (descending)                                        |
| GET    | `/brand/:brandId` | Public | —                      | Active models for a brand (paginated)                                    |
| GET    | `/:id`            | Public | —                      | Get single model (populated brand + category)                            |
| POST   | `/`               | Admin  | `createCarModelSchema` | Create model                                                             |
| PUT    | `/:id`            | Admin  | `updateCarModelSchema` | Update model                                                             |
| DELETE | `/:id`            | Admin  | —                      | Delete model (blocked if cars reference it)                              |

#### Create Car Model Body

```json
{
  "brand": "<ObjectId>", // required
  "name": "Seal", // required
  "nameAr": "سيل", // optional
  "category": "<ObjectId>", // required
  "year": 2026, // 2015-2030
  "generation": "1st Gen", // optional
  "engine": "1.5L Turbo", // default: "1.5L Turbo"
  "horsepower": 150, // default: 0
  "torque": "250 Nm", // optional
  "transmission": "Automatique", // enum: Manuelle|Automatique|CVT|Dual-Clutch
  "fuelType": "Essence", // enum: Essence|Diesel|Hybride|Electrique
  "fuelConsumption": "7.0L/100km", // default
  "seats": 5, // 2-8, default: 5
  "doors": 5, // 2-5, default: 5
  "features": [
    // array of French feature names
    "Climatisation Auto",
    "Caméra de Recul",
    "Android Auto/Apple CarPlay",
    "Toit Panoramique",
    "Sièges Cuir",
    "Régulateur de Vitesse",
    "Capteurs de Stationnement",
    "Jantes Alliage",
    "ESP",
    "ABS",
    "Airbags Multiples",
    "Démarrage sans Clé"
  ],
  "priceRangeDZD": { "min": 3000000, "max": 5000000 },
  "popularity": 80,
  "isActive": true,
  "description": "...",
  "images": ["url1", "url2"]
}
```

---

### Cars (`/api/cars`)

> **All public GET endpoints** accept `?lang=ar` to return Arabic display names for brand, model, and category.
> **All public GET endpoints** use serialized responses — sensitive fields (`costPriceDZD`, `internalNotes`, `createdBy`, `updatedBy`) are NEVER exposed.

| Method | Path               | Access    | Body / Validation        | Description                                                                                                              |
| ------ | ------------------ | --------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/`                | Public    | —                        | List cars (filter: `status`, `brand`, `model`, `category`, `minPrice`, `maxPrice`, `color`, `sortBy`, `lang`, paginated) |
| GET    | `/static`          | Public    | —                        | Minimal car data for Next.js `generateStaticParams()` (id, stockNumber, slug, updatedAt)                                 |
| GET    | `/vin/public/:vin` | Public    | —                        | Minimal VIN lookup (status, stockNumber, brand/model name, finalPriceDZD)                                                |
| GET    | `/vin/:vin`        | Protected | —                        | Detailed VIN lookup (full serialized car + expectedDeliveryDate, customerNotes)                                          |
| GET    | `/:id`             | Public    | —                        | Get single car (serialized, no sensitive fields)                                                                         |
| GET    | `/stats/overview`  | Admin     | —                        | Inventory stats (total, by status, by brand, total value)                                                                |
| GET    | `/status/:status`  | Admin     | —                        | List cars by status (paginated)                                                                                          |
| POST   | `/`                | Admin     | `createCarSchema`        | Create car (auto-generates `stockNumber` if omitted)                                                                     |
| PUT    | `/:id`             | Admin     | `updateCarSchema`        | Update car                                                                                                               |
| PUT    | `/:id/status`      | Admin     | `updateCarStatusSchema`  | Update status (auto-sets `soldDate`/`arrivalDate`)                                                                       |
| POST   | `/:id/photos`      | Admin     | multipart `photos` field | Upload photos (max 10 files × 5MB)                                                                                       |
| DELETE | `/:id/photos`      | Admin     | `{ filename }`           | Delete a photo by filename                                                                                               |
| DELETE | `/:id`             | Admin     | —                        | Delete car + associated documents                                                                                        |

#### Query Params for `GET /api/cars`

| Param      | Type     | Example                                   |
| ---------- | -------- | ----------------------------------------- |
| `status`   | string   | `?status=In Stock`                        |
| `brand`    | ObjectId | `?brand=<id>`                             |
| `model`    | ObjectId | `?model=<id>`                             |
| `category` | ObjectId | `?category=<id>`                          |
| `minPrice` | number   | `?minPrice=3000000`                       |
| `maxPrice` | number   | `?maxPrice=8000000`                       |
| `color`    | string   | `?color=white` (regex, case-insensitive)  |
| `sortBy`   | string   | `price-low`, `price-high`, `newest`       |
| `lang`     | string   | `?lang=ar` (returns Arabic display names) |
| `page`     | number   | `?page=1`                                 |
| `limit`    | number   | `?limit=10`                               |

#### Create Car Body

```json
{
  "brand": "<ObjectId>",
  "model": "<ObjectId>",
  "category": "<ObjectId>",
  "vin": "LSGPC84V5PA123456", // optional, 17 chars, auto-uppercased
  "stockNumber": "STOCK-00001", // optional, auto-generated if omitted
  "color": "Pearl White", // required
  "colorCode": "#FFFFFF", // optional
  "mileage": 0, // default: 0
  "costPriceDZD": 4000000, // required (admin-only field)
  "sellingPriceDZD": 5500000, // required
  "discountDZD": 0, // default: 0
  "status": "In Transit", // enum, default: "In Transit"
  "arrivalDate": null, // optional
  "expectedDeliveryDate": "2026-04-15", // optional
  "specs": {
    "engine": "1.5L Turbo",
    "transmission": "Automatique",
    "fuelType": "Essence",
    "fuelConsumption": "7.0L/100km",
    "warranty": "3 ans / 100 000 km"
  },
  "features": ["Climatisation Auto", "Caméra de Recul"],
  "photos": [],
  "videos": [],
  "internalNotes": "Admin-only notes",
  "customerNotes": "Visible to customers"
}
```

#### Car Status Values

| Status        | Meaning              | Auto-set Fields       |
| ------------- | -------------------- | --------------------- |
| `In Transit`  | Shipping from origin | —                     |
| `In Stock`    | Arrived at warehouse | `arrivalDate = now()` |
| `Reserved`    | Customer reserved    | —                     |
| `Sold`        | Sale completed       | `soldDate = now()`    |
| `Maintenance` | Being serviced       | —                     |
| `Damaged`     | Damage reported      | —                     |

#### Upload Photos — `POST /api/cars/:id/photos`

```
Content-Type: multipart/form-data
Field: "photos" (up to 10 files, max 5MB each, jpeg/jpg/png/webp)

// Response (200)
{
  "success": true,
  "message": "3 photo(s) uploaded",
  "photos": ["/uploads/photos-123.jpg", "/uploads/photos-456.jpg", ...]
}
```

#### Delete Photo — `DELETE /api/cars/:id/photos`

```json
// Request
{ "filename": "photos-123.jpg" }

// Response (200)
{ "success": true, "message": "Photo deleted", "photos": [...] }
```

#### Public VIN Lookup — `GET /api/cars/vin/public/:vin`

Returns minimum fields for unauthenticated tracking:

```json
{
  "success": true,
  "car": {
    "status": "In Transit",
    "stockNumber": "STOCK-00001",
    "brand": { "name": "BYD" },
    "model": { "name": "Seal" },
    "finalPriceDZD": 5500000
  }
}
```

#### Protected VIN Lookup — `GET /api/cars/vin/:vin`

Requires `Authorization: Bearer <token>`. Returns full serialized car (no sensitive admin fields):

```json
{
  "success": true,
  "car": {
    "id": "...", "brand": { "id", "name", "displayName", "logo", "origin" },
    "model": { "id", "name", "displayName", "year", ... },
    "category": { "id", "name", "displayName" },
    "vin", "stockNumber", "color", "finalPriceDZD", "status",
    "specs", "features", "photos", "customerNotes",
    "expectedDeliveryDate", "arrivalDate", "soldDate", ...
  }
}
```

#### Static Generation — `GET /api/cars/static`

For Next.js `generateStaticParams()`:

```json
{
  "success": true,
  "cars": [
    { "id": "abc123", "stockNumber": "STOCK-00001", "slug": "stock-00001", "updatedAt": "..." },
    ...
  ]
}
```

#### Car Stats — `GET /api/cars/stats/overview`

```json
{
  "success": true,
  "data": {
    "totalCars": 42,
    "carsByStatus": [{ "_id": "In Stock", "count": 15 }, ...],
    "carsByBrand": [{ "brand": "BYD", "count": 10 }, ...],
    "totalInventoryValueDZD": 150000000
  }
}
```

---

### Leads (`/api/leads`)

| Method | Path          | Access    | Body / Validation        | Description                                       |
| ------ | ------------- | --------- | ------------------------ | ------------------------------------------------- |
| POST   | `/`           | Public    | `createLeadSchema`       | Submit a lead (landing page inquiry)              |
| POST   | `/meeting`    | Protected | `meetingBookingSchema`   | Book a meeting (creates lead + calendar/WhatsApp) |
| GET    | `/`           | Admin     | —                        | List leads (filter: `status`, `since`, paginated) |
| GET    | `/:id`        | Admin     | —                        | Get single lead                                   |
| PUT    | `/:id/status` | Admin     | `updateLeadStatusSchema` | Update lead status                                |

#### Create Lead — `POST /api/leads`

```json
// Request
{
  "name": "Ahmed",                    // required
  "phone": "+213 555 12 34 56",       // required, Algerian format
  "email": "ahmed@example.com",       // optional
  "message": "I'm interested...",     // optional
  "interestedModel": "BYD Seal 2026", // required
  "source": "Website Form"            // enum: "Website Form"|"WhatsApp"|"Meeting Booking"
}

// Response (201)
{ "success": true, "lead": { ... } }
```

#### Book Meeting — `POST /api/leads/meeting`

Requires authentication. Creates a lead with source "Meeting Booking" and returns calendar/WhatsApp integration:

```json
// Request
{
  "carId": "<ObjectId>",
  "preferredDate": "2026-04-15T00:00:00Z",   // ISO 8601
  "preferredTimeSlot": "morning",              // "morning"|"afternoon"|"evening"
  "notes": "Optional notes"
}

// Response (201)
{
  "success": true,
  "lead": { ... },
  "meeting": {
    "preferredDate": "2026-04-15T00:00:00Z",
    "preferredTimeSlot": "morning",
    "calendarEvent": {
      "summary": "AutoShip DZ — Meeting: BYD Seal 2026",
      "dtstart": "20260415T090000",
      "dtend": "20260415T120000",
      "description": "Meeting about BYD Seal 2026. Stock: STOCK-00001.",
      "location": "AutoShip DZ Showroom"
    },
    "whatsAppLink": "https://wa.me/213555000000?text=..."
  }
}
```

#### Lead Status Values

`New` → `Contacted` → `Visited Store` → `Sold` or `Lost`

#### Query Params for `GET /api/leads`

| Param    | Type   | Example                             |
| -------- | ------ | ----------------------------------- |
| `status` | string | `?status=New`                       |
| `since`  | number | `?since=7` (leads from last 7 days) |
| `page`   | number | `?page=1`                           |
| `limit`  | number | `?limit=10`                         |

---

### Documents (`/api/documents`)

| Method | Path          | Access | Body / Validation       | Description                         |
| ------ | ------------- | ------ | ----------------------- | ----------------------------------- |
| POST   | `/upload`     | Admin  | multipart `file` + body | Upload file, link to car            |
| GET    | `/car/:carId` | Admin  | —                       | Get documents for a car (paginated) |
| DELETE | `/:id`        | Admin  | —                       | Delete document (DB + disk)         |

#### Upload Document — `POST /api/documents/upload`

```
Content-Type: multipart/form-data
Fields:
  - file: (single file, max 5MB, jpeg/jpg/png/webp/pdf)
  - carId: "<ObjectId>"
  - type: "COC" | "invoice" | "customs" | "bill_of_lading"
```

---

### Reports (`/api/reports`)

| Method | Path                      | Access | Query Params    | Description                                                   |
| ------ | ------------------------- | ------ | --------------- | ------------------------------------------------------------- |
| GET    | `/stats`                  | Admin  | —               | Dashboard stats (totalCars, inStock, sold, leadsThisWeek)     |
| GET    | `/revenue?month=X&year=Y` | Admin  | `month`, `year` | Monthly revenue (filters by `soldDate`, uses `finalPriceDZD`) |
| GET    | `/top-models`             | Admin  | —               | Top 5 sold models                                             |

#### Dashboard Stats — `GET /api/reports/stats`

```json
{
  "success": true,
  "data": {
    "totalCars": 42,
    "carsInStock": 15,
    "carsSold": 20,
    "leadsThisWeek": 8
  }
}
```

#### Monthly Revenue — `GET /api/reports/revenue?month=3&year=2026`

```json
{
  "success": true,
  "data": {
    "month": 3,
    "year": 2026,
    "totalRevenue": 55000000,
    "carsSold": 10
  }
}
```

#### Top Models — `GET /api/reports/top-models`

```json
{
  "success": true,
  "data": [
    { "model": "BYD Seal", "count": 8 },
    { "model": "Chery Tiggo 7", "count": 5 }
  ]
}
```

---

### Other

| Method | Path         | Description                                      |
| ------ | ------------ | ------------------------------------------------ |
| GET    | `/health`    | Health check (`{ success, message, timestamp }`) |
| GET    | `/uploads/*` | Static file serving for uploaded files           |

---

## 5. DATA MODELS

### User

```
name: String (required, trimmed)
email: String (required, unique, lowercase)
password: String (required, bcrypt-hashed)
phone: String (required, Algerian format)
role: "admin" | "user" (default: "user")
timestamps: createdAt, updatedAt
Methods: comparePassword(candidate) → boolean
```

### Brand

```
name: String (required, unique, uppercase)
origin: "China"|"Japan"|"Germany"|"France"|"Korea"|"USA"|"Other" (default: "China")
logo: String
description: String
isActive: Boolean (default: true)
popularity: Number (0-100)
warrantyYears: Number (min: 1, default: 3)
hasLocalServiceCenter: Boolean
website: String
Indexes: [origin + isActive]
Cascade: Cannot delete if CarModels or Cars reference it
```

### Category

```
name: String (required, unique)
nameAr: String (Arabic name)
description: String
icon: String
sortOrder: Number (default: 0)
Indexes: [sortOrder]
Cascade: Cannot delete if CarModels reference it
```

### CarModel

```
brand: ObjectId → Brand (required)
name: String (required)
nameAr: String (Arabic)
category: ObjectId → Category (required)
year: Number (2015-2030)
generation: String
engine: String (default: "1.5L Turbo")
horsepower: Number
torque: String
transmission: "Manuelle"|"Automatique"|"CVT"|"Dual-Clutch"
fuelType: "Essence"|"Diesel"|"Hybride"|"Electrique"
fuelConsumption: String (default: "7.0L/100km")
seats: Number (2-8, default: 5)
doors: Number (2-5, default: 5)
features: [CarFeature enum — 12 options in French]
priceRangeDZD: { min, max }
popularity: Number (0-100)
isActive: Boolean
description: String
images: [String]
Indexes: [brand + category], [year + popularity desc]
Cascade: Cannot delete if Cars reference it
```

### Car (Inventory Item)

```
brand: ObjectId → Brand (required)
model: ObjectId → CarModel (required)
category: ObjectId → Category (required)
vin: String (unique, sparse, 17 chars, regex-validated)
stockNumber: String (unique, required, auto-generated as STOCK-XXXXX)
color: String (required)
colorCode: String
mileage: Number (default: 0)
costPriceDZD: Number (required) — admin-only field
sellingPriceDZD: Number (required)
discountDZD: Number (default: 0)
finalPriceDZD: Number (computed: sellingPrice - discount, via pre-save hook)
status: "In Transit"|"In Stock"|"Reserved"|"Sold"|"Maintenance"|"Damaged"
arrivalDate: Date | null
expectedDeliveryDate: Date | null
soldDate: Date | null
specs: { engine, transmission, fuelType, fuelConsumption, warranty }
features: [String]
photos: [String]
videos: [String]
documents: [ObjectId → Document]
internalNotes: String — admin-only field
customerNotes: String
createdBy: ObjectId → User (required)
updatedBy: ObjectId → User
Virtuals: profitMargin (%), isDiscounted (boolean)
Indexes: [status + brand], [createdAt desc]
```

### Lead

```
name: String (required)
phone: String (required, Algerian regex)
email: String (optional, lowercase)
message: String
interestedModel: String (required)
status: "New"|"Contacted"|"Visited Store"|"Sold"|"Lost" (default: "New")
source: "Website Form"|"WhatsApp" (default: "Website Form")
submittedBy: ObjectId → User | null
Indexes: [status], [createdAt desc]
```

### Document

```
car: ObjectId → Car (required)
type: "COC"|"invoice"|"customs"|"bill_of_lading"
name: String (required) — original filename
url: String (required) — /uploads/filename
uploadedBy: ObjectId → User (required)
Indexes: [car]
```

---

## 6. RESPONSE FORMATS

### Success (single entity)

```json
{ "success": true, "brand": { ... } }
```

### Success (list with pagination)

```json
{
  "success": true,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalItems": 42,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "cars": [...]
}
```

### Error

```json
{
  "success": false,
  "error": {
    "message": "Description of error",
    "details": "..." // validation errors only (Zod prettified)
  }
}
```

### HTTP Status Codes Used

| Code | Meaning                                |
| ---- | -------------------------------------- |
| 200  | OK (get / update)                      |
| 201  | Created                                |
| 400  | Bad Request                            |
| 401  | Unauthorized                           |
| 403  | Forbidden                              |
| 404  | Not Found                              |
| 409  | Conflict (duplicates / cascade blocks) |
| 429  | Too Many Requests (rate limit)         |
| 500  | Internal Server Error                  |

---

## 7. PAGINATION

All list endpoints support pagination via query parameters:

| Param   | Default | Max | Description         |
| ------- | ------- | --- | ------------------- |
| `page`  | 1       | —   | Current page number |
| `limit` | 10      | 50  | Items per page      |

Response always includes a `pagination` object with: `page`, `limit`, `totalPages`, `totalItems`, `hasNextPage`, `hasPrevPage`.

---

## 8. FILE UPLOADS

| Middleware     | Field    | Max Files | Max Size | Allowed Types             |
| -------------- | -------- | --------- | -------- | ------------------------- |
| `uploadSingle` | `file`   | 1         | 5MB      | jpeg, jpg, png, webp, pdf |
| `uploadPhotos` | `photos` | 10        | 5MB each | jpeg, jpg, png, webp, pdf |

Files are stored in `./uploads/` directory and served at `/uploads/<filename>`.

---

## 9. FRONTEND INTEGRATION GUIDE

### Connecting to the API

```typescript
const API_BASE = "http://localhost:4000/api";

// Axios instance example
const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Landing Page (Public / User)

The landing page needs these public endpoints (no auth required):

| Page Section       | Endpoint(s)                                                       |
| ------------------ | ----------------------------------------------------------------- |
| Hero / Browse Cars | `GET /api/cars?status=In Stock&sortBy=newest`                     |
| Filter Bar         | `GET /api/brands`, `GET /api/categories`, `GET /api/models/years` |
| Brand Showcase     | `GET /api/brands/popular`                                         |
| Car Detail Page    | `GET /api/cars/:id`                                               |
| Models by Brand    | `GET /api/models/brand/:brandId`                                  |
| VIN Tracking       | `GET /api/cars/vin/:vin`                                          |
| Contact / Inquiry  | `POST /api/leads` (with `createLeadSchema`)                       |
| Register           | `POST /api/auth/register`                                         |
| Login              | `POST /api/auth/login`                                            |

### Admin Dashboard (Admin Only)

All admin endpoints require `Authorization: Bearer <token>` with admin role.

| Dashboard Section               | Endpoint(s)                                  |
| ------------------------------- | -------------------------------------------- |
| Overview Stats                  | `GET /api/reports/stats`                     |
| Revenue Chart                   | `GET /api/reports/revenue?month=X&year=Y`    |
| Top Models                      | `GET /api/reports/top-models`                |
| Car Inventory Stats             | `GET /api/cars/stats/overview`               |
| **Car Management**              |                                              |
| List Cars                       | `GET /api/cars` (with filters + pagination)  |
| Cars by Status                  | `GET /api/cars/status/:status`               |
| Create Car                      | `POST /api/cars`                             |
| Update Car                      | `PUT /api/cars/:id`                          |
| Change Status                   | `PUT /api/cars/:id/status`                   |
| Upload Photos                   | `POST /api/cars/:id/photos` (multipart)      |
| Delete Photo                    | `DELETE /api/cars/:id/photos`                |
| Delete Car                      | `DELETE /api/cars/:id`                       |
| **Brand Management**            |                                              |
| List / Create / Update / Delete | `/api/brands` (CRUD)                         |
| **Category Management**         |                                              |
| List / Create / Update / Delete | `/api/categories` (CRUD)                     |
| **Model Management**            |                                              |
| List / Create / Update / Delete | `/api/models` (CRUD)                         |
| **Lead Management**             |                                              |
| List Leads                      | `GET /api/leads` (filter: `status`, `since`) |
| View Lead                       | `GET /api/leads/:id`                         |
| Update Lead Status              | `PUT /api/leads/:id/status`                  |
| **Document Management**         |                                              |
| Upload Document                 | `POST /api/documents/upload` (multipart)     |
| List by Car                     | `GET /api/documents/car/:carId`              |
| Delete Document                 | `DELETE /api/documents/:id`                  |
| **Account**                     |                                              |
| Profile                         | `GET /api/auth/me`                           |
| Change Password                 | `PUT /api/auth/password`                     |

---

## 10. KEY CONVENTIONS

- **All prices in DZD (Algerian Dinar)** — suffixed with `DZD`
- **French feature names** — the app targets the Algerian market
- **Algerian phone format:** `+213 XXX XX XX XX`
- **ObjectId references** are populated in GET responses
- **Auth pattern:** `protect` → `authorize("admin")` → `validateBodySchema(schema)` → controller
- **Admin can't self-register** — must be seeded via `seed-admin.ts`
- **Cascade delete protection** — Brand, Category, and CarModel cannot be deleted if referenced

---

## 11. SECURITY

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT with configurable secret and expiry
- ✅ Helmet security headers
- ✅ CORS restricted to frontend domain
- ✅ Role-based route protection
- ✅ Rate limiting on auth, public, and API routes
- ✅ Admin cannot self-register
- ✅ Password change requires current password
- ✅ `protect` middleware verifies user still exists in DB

---

_This analysis reflects the exact state of the codebase as of March 25, 2026. The project compiles with zero TypeScript errors._
