# Supabase Authentication Implementation Plan
## Email/Password Auth with Designation at Zapcom

**Date:** November 6, 2025  
**Project:** ZapMinds Academy  
**Auth Provider:** Supabase (Email/Password)

---

## 📋 Overview

This plan outlines the implementation of email/password authentication using Supabase MCP server, including user registration, login, and storing designation information at Zapcom.

---

## 🎯 Objectives

1. ✅ Set up Supabase client configuration in Nuxt 3
2. ✅ Add `designation` field to profiles table
3. ✅ Implement Sign Up functionality with email, password, and designation
4. ✅ Implement Sign In functionality with email and password
5. ✅ Create authentication state management
6. ✅ Add form validation and error handling
7. ✅ Update UI components for authenticated state
8. ✅ Implement protected routes (if needed)
9. ✅ Add proper error messages and user feedback
10. ✅ Write tests for authentication flows

---

## 🗄️ Database Schema Changes

### Step 1: Add `designation` field to profiles table

**Migration:** `add_designation_to_profiles`

```sql
-- Add designation column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS designation TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.designation IS 'User designation/role at Zapcom';
```

**RLS Policy Check:**
- Verify existing RLS policies allow users to read/update their own profile
- Ensure designation field is accessible via RLS

---

## 🔧 Configuration & Setup

### Step 2: Environment Variables

**File:** `.env` (add to existing)

```env
# Supabase Configuration
NUXT_SUPABASE_URL=https://qvwnzvhrsstqmftycegj.supabase.co
NUXT_SUPABASE_ANON_KEY=<your-anon-key>
```

**Action Required:**
- Get Supabase anon key from Supabase dashboard
- Add to `.env` file (already exists but hidden)

### Step 3: Update Nuxt Config

**File:** `front-end/nuxt.config.ts`

**Changes:**
- Add Supabase URL and anon key to `runtimeConfig.public`
- No additional modules needed (Supabase JS client already installed)

```typescript
const runtimeConfig = {
  // ... existing config
  public: {
    siteBaseUrl: process.env.NUXT_SITE_BASE_URL,
    siteDomain: process.env.NUXT_SITE_DOMAIN,
    supabaseUrl: process.env.NUXT_SUPABASE_URL,
    supabaseAnonKey: process.env.NUXT_SUPABASE_ANON_KEY,
  },
};
```

---

## 🏗️ Architecture & File Structure

### New Files to Create:

```
front-end/
├── utils/
│   └── supabase.ts              # Supabase client initialization
├── composables/
│   ├── useAuth.ts               # Main auth composable
│   └── useSupabase.ts           # Supabase client composable
├── plugins/
│   └── 04.supabase.client.ts    # Initialize Supabase on client
├── types/
│   └── auth.d.ts                # TypeScript types for auth
└── server/
    └── api/
        └── auth/
            └── profile.post.ts  # Server-side profile creation (optional)
```

### Files to Modify:

```
front-end/
├── pages/
│   ├── signin.vue               # Add sign in form
│   └── signup.vue               # Add sign up form
├── components/
│   └── organisms/
│       └── VHeader.vue          # Update for auth state
└── nuxt.config.ts               # Add Supabase config
```

---

## 📝 Implementation Steps

### Phase 1: Foundation Setup

#### Step 4: Create Supabase Client Utility

**File:** `front-end/utils/supabase.ts`

**Purpose:** Initialize and export Supabase client

**Implementation:**
- Create singleton Supabase client instance
- Use runtime config for URL and anon key
- Export for use in composables and components

#### Step 5: Create Supabase Composable

**File:** `front-end/composables/useSupabase.ts`

**Purpose:** Provide Supabase client to components

**Implementation:**
- Use `useNuxtApp()` to access runtime config
- Return Supabase client instance
- Handle client-side only initialization

#### Step 6: Create Auth Composable

**File:** `front-end/composables/useAuth.ts`

**Purpose:** Centralized authentication state and methods

**Features:**
- `user` - reactive user state
- `session` - reactive session state
- `signUp(email, password, designation)` - registration
- `signIn(email, password)` - login
- `signOut()` - logout
- `getUser()` - fetch current user
- `onAuthStateChange()` - listen to auth changes

**Error Handling:**
- Wrap all Supabase calls in try-catch
- Return structured error objects
- Provide user-friendly error messages

### Phase 2: Database & Types

#### Step 7: Add TypeScript Types

**File:** `front-end/types/auth.d.ts`

**Types:**
- `AuthUser` - user object structure
- `SignUpData` - sign up form data
- `SignInData` - sign in form data
- `AuthError` - error structure

#### Step 8: Database Migration

**Action:** Use Supabase MCP to apply migration

**Migration Name:** `add_designation_to_profiles`

**SQL:**
```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS designation TEXT;
```

**Verification:**
- Check column exists
- Verify RLS policies still work
- Test profile creation with designation

### Phase 3: UI Components

#### Step 9: Create Sign Up Form Component

**File:** `front-end/pages/signup.vue`

**Form Fields:**
- Email (required, email validation)
- Password (required, min 6 characters)
- Confirm Password (required, must match)
- Designation (required, text input)

**Features:**
- Form validation (client-side)
- Loading state during submission
- Error message display
- Success handling (redirect to home or dashboard)
- Link to sign in page

**Validation Rules:**
- Email: valid email format
- Password: minimum 6 characters
- Confirm Password: must match password
- Designation: required, non-empty

#### Step 10: Create Sign In Form Component

**File:** `front-end/pages/signin.vue`

**Form Fields:**
- Email (required, email validation)
- Password (required)

**Features:**
- Form validation
- Loading state
- Error message display
- Success handling (redirect)
- Link to sign up page
- "Forgot Password" link (future enhancement)

#### Step 11: Update Header Component

**File:** `front-end/components/organisms/VHeader.vue`

**Changes:**
- Show user info when authenticated
- Replace "Sign In/Sign Up" with "Sign Out" when logged in
- Display user email or name
- Add dropdown menu (optional) for profile/settings

**Conditional Rendering:**
```vue
<div v-if="user">
  <!-- Authenticated state -->
</div>
<div v-else>
  <!-- Sign In/Sign Up buttons -->
</div>
```

### Phase 4: Server-Side Integration

#### Step 12: Create Profile Trigger (Optional)

**Purpose:** Automatically create profile when user signs up

**Implementation Options:**

**Option A: Database Trigger (Recommended)**
- Create PostgreSQL trigger function
- Automatically insert profile row on user creation
- Include designation from metadata

**Option B: Client-Side Hook**
- Use Supabase auth state change listener
- Create profile after sign up success
- Handle errors gracefully

**Option C: Server API Route**
- Create Nuxt server API endpoint
- Call from client after sign up
- More control but additional network call

**Recommendation:** Option A (Database Trigger) for reliability

### Phase 5: Error Handling & Validation

#### Step 13: Error Message Mapping

**Create:** Error message utility

**Purpose:** Map Supabase errors to user-friendly messages

**Common Errors:**
- `User already registered` → "This email is already registered"
- `Invalid login credentials` → "Invalid email or password"
- `Email not confirmed` → "Please check your email to confirm your account"
- `Weak password` → "Password must be at least 6 characters"
- Network errors → "Connection error. Please try again."

#### Step 14: Form Validation

**Implementation:**
- Use Vue 3 reactive forms
- Real-time validation feedback
- Disable submit button when invalid
- Show inline error messages

**Libraries (Optional):**
- `vee-validate` + `yup` (if complex validation needed)
- Or native HTML5 validation + custom Vue validation

### Phase 6: State Management & Persistence

#### Step 15: Session Persistence

**Implementation:**
- Supabase handles session storage automatically
- Use `localStorage` for session persistence
- Initialize auth state on app load
- Handle session refresh

#### Step 16: Auth State Listener

**Implementation:**
- Set up `onAuthStateChange` listener in plugin
- Update global auth state reactively
- Handle token refresh
- Redirect on auth state changes

### Phase 7: Testing

#### Step 17: Unit Tests

**Files to Test:**
- `composables/useAuth.ts`
- Form validation logic
- Error handling

**Test Cases:**
- Sign up with valid data
- Sign up with invalid email
- Sign up with weak password
- Sign in with correct credentials
- Sign in with incorrect credentials
- Sign out functionality
- Session persistence

#### Step 18: Integration Tests

**Test Scenarios:**
- Complete sign up flow
- Complete sign in flow
- Profile creation with designation
- Protected route access
- Session refresh

### Phase 8: Security & Best Practices

#### Step 19: Security Checklist

- ✅ Use environment variables for secrets
- ✅ Enable RLS on profiles table
- ✅ Validate all inputs server-side
- ✅ Use HTTPS in production
- ✅ Implement rate limiting (Supabase handles this)
- ✅ Sanitize user inputs
- ✅ Use parameterized queries (Supabase handles this)

#### Step 20: RLS Policies Verification

**Verify:**
- Users can only read their own profile
- Users can only update their own profile
- Public read access (if needed for certain fields)
- Admin access (if needed)

---

## 🔄 User Flows

### Sign Up Flow

1. User clicks "Sign Up" in header
2. Navigate to `/signup`
3. Fill form: email, password, confirm password, designation
4. Client-side validation
5. Submit → `signUp(email, password, { designation })`
6. Supabase creates auth user
7. Database trigger creates profile with designation
8. Success → Redirect to home or dashboard
9. Error → Display error message

### Sign In Flow

1. User clicks "Sign In" in header
2. Navigate to `/signin`
3. Fill form: email, password
4. Client-side validation
5. Submit → `signIn(email, password)`
6. Supabase authenticates
7. Success → Set session, redirect to home
8. Error → Display error message

### Sign Out Flow

1. User clicks "Sign Out" in header
2. Call `signOut()`
3. Clear session
4. Redirect to home
5. Update UI (show Sign In/Sign Up buttons)

---

## 📦 Dependencies

### Already Installed:
- ✅ `@supabase/supabase-js@^2.79.0`

### May Need (Optional):
- `vee-validate` - Form validation (if needed)
- `yup` - Schema validation (if needed)

---

## 🚨 Error Handling Strategy

### Client-Side Errors:
- Network errors → Retry mechanism
- Validation errors → Inline form feedback
- Auth errors → User-friendly messages
- Unknown errors → Generic error message + logging

### Server-Side Errors:
- Supabase errors → Map to user messages
- Database errors → Log and show generic message
- Rate limiting → Show appropriate message

---

## 📊 Success Metrics

- ✅ Users can successfully sign up
- ✅ Users can successfully sign in
- ✅ Designation is stored correctly
- ✅ Session persists across page refreshes
- ✅ Errors are handled gracefully
- ✅ Forms validate correctly
- ✅ UI updates based on auth state

---

## 🔜 Future Enhancements

- Email verification flow
- Password reset functionality
- Social authentication (Google, GitHub)
- Profile management page
- Protected routes/dashboard
- Role-based access control
- Two-factor authentication

---

## 📝 Implementation Checklist

### Phase 1: Foundation
- [ ] Step 4: Create Supabase client utility
- [ ] Step 5: Create Supabase composable
- [ ] Step 6: Create Auth composable
- [ ] Step 3: Update Nuxt config

### Phase 2: Database
- [ ] Step 8: Apply database migration
- [ ] Step 7: Add TypeScript types
- [ ] Verify RLS policies

### Phase 3: UI
- [ ] Step 9: Create Sign Up form
- [ ] Step 10: Create Sign In form
- [ ] Step 11: Update Header component

### Phase 4: Integration
- [ ] Step 12: Set up profile creation
- [ ] Step 13: Error message mapping
- [ ] Step 14: Form validation

### Phase 5: State & Testing
- [ ] Step 15: Session persistence
- [ ] Step 16: Auth state listener
- [ ] Step 17: Unit tests
- [ ] Step 18: Integration tests

### Phase 6: Security
- [ ] Step 19: Security checklist
- [ ] Step 20: RLS verification

---

## 🎯 Next Steps

1. **Review this plan** and approve approach
2. **Get Supabase credentials** (anon key)
3. **Start with Phase 1** (Foundation Setup)
4. **Test incrementally** after each phase
5. **Document as you go** in dev_documentation.txt

---

## 📚 References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Nuxt 3 Composables](https://nuxt.com/docs/guide/directory-structure/composables)
- [Vue 3 Forms](https://vuejs.org/guide/essentials/forms.html)

---

**Plan Created:** November 6, 2025  
**Status:** Ready for Implementation  
**Estimated Time:** 2-3 days for full implementation

