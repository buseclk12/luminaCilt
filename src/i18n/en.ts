export default {
  // Common
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    done: "Done",
    or: "or",
  },

  // Auth
  auth: {
    login: "Log In",
    register: "Sign Up",
    logout: "Log Out",
    email: "Email",
    password: "Password",
    name: "Name",
    emailPlaceholder: "example@email.com",
    passwordPlaceholder: "At least 6 characters",
    namePlaceholder: "Your name",
    loginButton: "Log In",
    registerButton: "Create Account",
    loggingIn: "Logging in...",
    registering: "Creating...",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    fillAll: "Please fill in all fields.",
    loginError: "Login Error",
    registerError: "Registration Error",
    logoutConfirm: "Are you sure you want to log out?",
    skinJourney: "Start your skincare journey",
    invalidEmail: "Please enter a valid email address.",
    weakPassword: "Password must be at least 6 characters.",
  },

  // Skin Types
  skinType: {
    title: "Skin Type",
    kuru: "Dry",
    yagli: "Oily",
    karma: "Combination",
    hassas: "Sensitive",
    normal: "Normal",
    unknown: "Unknown",
  },

  // Home
  home: {
    greeting: "Hello",
    subtitle: "Ready to take care of your skin?",
    dailyRoutine: "Daily Routine",
    eveningWaiting: "Your evening routine is waiting",
    morningStart: "Start your morning routine",
    allDone: "Today's routine is complete!",
    observing: "Under Observation",
    productsObserving: "{{count}} product(s) being observed",
    quickActions: "Quick Actions",
    addProduct: "Add Product",
    quickRoutine: "Quick Routine",
    tipTitle: "Tip of the Day",
    tipText:
      "When testing a new product, add only one at a time. This way, you can match skin feedback to the right product.",
  },

  // Routine
  routine: {
    title: "Daily Routine",
    morning: "Morning Routine",
    evening: "Evening Routine",
    stepsCompleted: "{{completed}}/{{total}} steps completed",
    quickRoutine: "Quick Routine (Cleanse + Moisturize)",
    step: "Step {{number}}",
    noRoutine: "No routine added yet.",
    addRoutineHint: "Add products from the Products tab to build your routine.",
    completedToday: "Today's routine is complete!",
    routineReset: "A new day tomorrow!",
  },

  // Products
  products: {
    title: "My Products",
    addProduct: "Add New Product",
    productName: "Product Name",
    productPlaceholder: "e.g. CeraVe Moisturizer",
    category: "Category",
    addButton: "Add Product & Start Observation",
    observationInfo: "7-Day Observation",
    observationDesc:
      "New products are automatically placed under 7-day observation. Log skin changes daily.",
    dayProgress: "Day {{current}}/{{total}}",
    enterNote: "Enter today's note",
    noProducts: "No products in this category.",
    fillRequired: "Please enter product name and select a category.",
    deleteConfirm: "Are you sure you want to delete this product?",
    deleteProduct: "Delete Product",
    markActive: "Mark as Active",
    markDropped: "Mark as Dropped",
    // Filters
    all: "All",
    observing: "Observing",
    active: "Active",
    dropped: "Dropped",
    // Categories
    temizleyici: "Cleanser",
    tonik: "Toner",
    serum: "Serum",
    nemlendirici: "Moisturizer",
    gunes_kremi: "Sunscreen",
    diger: "Other",
  },

  // Observation
  observation: {
    title: "Daily Observation",
    howIsYourSkin: "How's your skin today?",
    irritation: "Irritation / Redness",
    breakout: "Breakout / Blemish",
    hydration: "Hydration Level",
    note: "Note (optional)",
    notePlaceholder: "Anything you noticed today?",
    submit: "Save Observation",
    day: "Day {{number}}",
    scores: {
      1: "Very good",
      2: "Good",
      3: "Normal",
      4: "Bad",
      5: "Very bad",
    },
    hydrationScores: {
      1: "Very dry",
      2: "Dry",
      3: "Normal",
      4: "Hydrated",
      5: "Very hydrated",
    },
    summary: "Observation Summary",
    goodResult: "This product works well for your skin!",
    badResult: "This product may cause irritation. Be careful.",
    neutralResult: "No significant effect observed.",
  },

  // Profile
  profile: {
    title: "Profile",
    editProfile: "Edit Profile",
    routineHours: "Routine Hours",
    notifications: "Notifications",
    helpSupport: "Help & Support",
    language: "Language",
    skinTypeLabel: "Skin Type: {{type}}",
    editName: "Name",
    editSkinType: "Skin Type",
    morningTime: "Morning Routine Time",
    eveningTime: "Evening Routine Time",
    saved: "Changes saved.",
    user: "User",
  },

  // Days
  days: {
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",
  },

  // Brand
  brand: {
    name: "Lumina",
    motto: "Know your skin, simplify your routine.",
  },

  // Tabs
  tabs: {
    home: "Home",
    routine: "Routine",
    products: "Products",
    profile: "Profile",
  },
};
