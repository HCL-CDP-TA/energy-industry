# CDP Event Tracking Reference

All events fire only when CDP tracking is enabled (`trackingType === "cdp"`). Events are sent via the HCL CDP Web SDK (`@hcl-cdp-ta/hclcdp-web-sdk-react`).

---

## Page View Events

Fired via the `<CdpPageEvent>` component from the HCL CDP SDK on every page load.

| Page | `pageName` value (from translations) | File |
|------|--------------------------------------|------|
| Home | `cdp.pageEventName` | `app/[locale]/[brand]/page.tsx` |
| Plans | `cdp.pageEventName` | `app/[locale]/[brand]/plans/page.tsx` |
| Checkout | `cdp.pageEventName` | `app/[locale]/[brand]/checkout/page.tsx` |
| Solar & Storage | `cdp.pageEventName` | `app/[locale]/[brand]/solar-storage/page.tsx` |
| Electric Vehicles | `cdp.pageEventName` | `app/[locale]/[brand]/electric-vehicles/page.tsx` |

**Properties sent with all page events:**

| Property | Type | Description |
|----------|------|-------------|
| `brand` | string | Brand label (e.g. "UniPower", "EnergyAustralia") |
| `locale` | string | Locale code (e.g. "en-AU") |

---

## Custom Events

### `plan_acquire`

**Trigger:** Plans page loads (fires in `useEffect` on mount)
**File:** `app/[locale]/[brand]/plans/page.tsx`
**Properties:** None

---

### `plan_interest`

**Trigger:** User selects a plan type filter on the plans page, or the page loads with a `?plan=` URL parameter that pre-selects a filter (e.g. navigating from the EV page with `?plan=ev`)
**File:** `components/plans/PlanGrid.tsx`

| Property | Type | Description |
|----------|------|-------------|
| `filter` | string | The selected filter value: `all`, `fixed`, `variable`, `tou`, `ev` |
| `source` | string | `"user"` if clicked manually, `"url"` if set via URL parameter |

---

### `plan_consider`

**Trigger:** User selects an address from the Google Places autocomplete dropdown
**File:** `components/plans/AddressLookup.tsx`

| Property | Type | Description |
|----------|------|-------------|
| `street_number` | string | Street number |
| `street_name` | string | Street name |
| `suburb` | string | Suburb / locality |
| `state` | string | State / administrative area |
| `postcode` | string | Postal code |
| `country` | string | Country code |
| `formatted_address` | string | Full formatted address |

---

### `plan_intent`

**Trigger:** User clicks "Select Plan" on a plan card (address must be entered first)
**File:** `components/plans/PlanCard.tsx`

| Property | Type | Description |
|----------|------|-------------|
| `plan_id` | string | Unique plan identifier |
| `plan_name` | string | Plan display name |
| `plan_type` | string | Plan type: `fixed`, `variable`, `tou`, `ev` |
| `daily_supply_charge` | number | Daily supply charge |
| `rate` | number | Rate per kWh (fixed/variable plans) |
| `peak_rate` | number | Peak rate per kWh (Time of Use plans) |
| `off_peak_rate` | number | Off-peak rate per kWh (Time of Use plans) |
| `shoulder_rate` | number | Shoulder rate per kWh (Time of Use plans, optional) |

---

### `plan_convert`

**Trigger:** User completes checkout by clicking "Complete" on the review step
**File:** `app/[locale]/[brand]/checkout/page.tsx`

| Property | Type | Description |
|----------|------|-------------|
| `planId` | string | Selected plan ID |
| `planName` | string | Selected plan name |
| `planType` | string | Plan type |
| `rate` | number | Plan rate |
| `peakRate` | number | Peak rate (ToU plans) |
| `offPeakRate` | number | Off-peak rate (ToU plans) |
| `shoulderRate` | number | Shoulder rate (ToU plans) |
| `dailySupplyCharge` | number | Daily supply charge |
| `contractTerm` | number | Contract term in months |
| `discountPercent` | number | Discount percentage |
| `greenEnergyPercent` | number | Green energy percentage |
| `supplyAddress` | string | Supply address entered |
| `customerType` | string | `"new"` or `"existing"` |
| `propertyType` | string | `"own"` or `"rent"` |
| `firstName` | string | Customer first name |
| `lastName` | string | Customer last name |
| `email` | string | Customer email |
| `mobile` | string | Customer mobile phone |
| `dob` | string | Customer date of birth |
| `mailingAddressSameAsSupply` | boolean | Whether mailing matches supply address |
| `mailingAddress` | string | Mailing address (if different) |
| `billDelivery` | string | Billing delivery preference |
| `correspondence` | string | Correspondence preference |
| `brand` | string | Brand label |
| `locale` | string | Locale code |
| `orderReference` | string | Generated order reference (format: `UP-XXXXXX`) |

---

### `ev_acquire`

**Trigger:** Electric Vehicles page loads (fires in `useEffect` on mount)
**File:** `app/[locale]/[brand]/electric-vehicles/page.tsx`
**Properties:** None

---

## Login / Registration Events

Fired via the `cdpLogin` function from the HCL CDP SDK, wrapped by the `loginWithAlternativeEmail` helper in `lib/utils.ts`.

### Login

**Trigger:** User successfully logs in via the login modal
**File:** `components/LoginModal.tsx`

| Property | Type | Description |
|----------|------|-------------|
| `identifier` | string | User ID |
| `alternative_email` | string | Alternative email from localStorage |

### Registration

**Trigger:** User successfully registers a new account via the login modal
**File:** `components/LoginModal.tsx`

| Property | Type | Description |
|----------|------|-------------|
| `identifier` | string | User ID |
| `alternative_email` | string | Alternative email from localStorage |
| `firstName` | string | User's first name |
| `lastName` | string | User's last name |

---

## Event Flow (Plans Journey)

```
Page Load         ->  plan_acquire
Filter Selected   ->  plan_interest  (with filter + source)
Address Selected  ->  plan_consider  (with address data)
Plan Selected     ->  plan_intent    (with plan data)
Checkout Complete ->  plan_convert   (with full order data)
```

## Event Flow (EV Journey)

```
Page Load         ->  ev_acquire
```
