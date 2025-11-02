import { Language } from './types';

type Strings = typeof en;

const en = {
  // General
  title: 'Garment Tracker',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  total: 'Total',
  from: 'From',
  to: 'To',
  users: 'Users',
  selectAll: 'Select All',
  deselectAll: 'Deselect All',
  english: 'English',
  hinglish: 'Hinglish',
  hindi: 'Hindi',
  
  // Navigation
  trackerNav: 'Tracker',
  logNav: 'Log',
  munshiNav: 'Munshi Ji',
  
  // Setup Screen
  setup: {
    welcomeTitle: 'Welcome to Garment Tracker',
    welcomeMessage: 'The simple way to track your piece work, earnings, and daily progress. Let\'s get you set up.',
    getStarted: 'Get Started',
    nameTitle: 'What should we call you?',
    namePrompt: 'This will be used to identify your work profile.',
    namePlaceholder: 'e.g., Rahul',
    continue: 'Continue',
    languageTitle: 'Choose Your Language',
    languagePrompt: 'Select the language you prefer for the app.',
  },
  
  // Categories
  okCategory: 'OK',
  reworkCategory: 'Rework',
  oilCategory: 'Oil',
  adasCategory: 'Adas',
  yarnCategory: 'Yarn',
  secondOkCategory: '2nd OK',

  // Tracker Screen
  addEntryButton: 'Add Entry',
  manageCategories: 'Manage Categories',
  deleteCategory: 'Delete category',
  addPresets: 'Add from presets',
  addCategory: 'Or add a custom category',
  categoryNamePlaceholder: 'Category Name',
  deleteCategoryConfirmation: 'Are you sure you want to delete the "{categoryName}" category? This cannot be undone.',
  startFirstSession: 'Start Your First Session',
  createFirstPreset: 'Create Your First Preset',
  noPresetsWelcome: 'Go to the Log screen to create "cloth type" presets with rates to track your earnings.',
  selectClothType: 'Select Cloth Type',
  manageClothTypes: 'Manage Cloth Types',
  clothTypeSelection: 'Cloth Type / Session',
  addSession: 'New Session',

  // Summary
  sessionSummary: 'Session Summary',
  categoryBreakdown: 'Category Breakdown',
  grandTotal: 'Total Pieces',

  // Entries List
  deleteEntry: 'Delete',
  noEntries: 'No entries recorded for this session yet.',
  recentEntries: 'Recent Entries',

  // Log Screen
  logTitle: 'Work Log',
  noRecords: 'No work records found.',
  exportData: 'Export Data',
  manageTrash: 'Manage Trash',
  selectLanguageTitle: 'Select Language',
  
  // Earnings Tracker
  earningsGoal: 'Earnings Goal',
  editGoal: 'Edit Goal',
  resetProgress: 'Reset Progress',
  setGoal: 'Set Earnings Goal',
  enterEarningsGoal: 'Enter your target earnings amount to track your progress.',
  resetEarningsConfirmationTitle: 'Reset Earnings Progress?',
  resetEarningsConfirmationBody: 'This will reset your earnings tracker to zero, starting from now. Your past work logs will not be deleted.',
  slideToConfirm: 'Slide to confirm',
  
  // Manage Presets Modal
  clothTypePresets: 'Cloth Type Presets',
  clothTypeName: 'Cloth type name',
  ratePerPiece: 'Rate per piece (₹)',
  editPreset: 'Edit preset',
  deletePreset: 'Delete preset',
  noPresets: 'No presets created yet.',
  addPreset: 'Add New Preset',
  newPresetName: 'e.g., Shirt Front',
  deletePresetConfirmation: 'Are you sure you want to delete the preset "{presetName}"?',
  
  // Select Preset Modal
  goToLogScreenToAdd: 'Go to the Log screen to add some.',

  // Archive Modal (Previously Delete)
  archiveTitle: 'Archive Sessions',
  archiveDescription: 'Select a date range and choose which work sessions to move to the trash.',
  sessionsInDateRange: 'Sessions in Date Range',
  noSessionsFound: 'No sessions found in the selected date range.',
  archiveConfirmation: 'This will move {count} session(s) to the trash, where they will be permanently deleted after 7 days. Type ARCHIVE to confirm.',
  archiveSelected: 'Archive Selected',
  
  // Export Modal
  exportDataTitle: 'Export Work Data',
  exportDataDescription: 'Generate a report of your work data based on the selected filters.',
  exportFormat: 'Export Format',
  exportFormatPdf: 'PDF Report',
  exportFormatCsv: 'Image Card',
  sessionNameFilter: 'Filter by Cloth Type Name',
  sessionNameFilterPlaceholder: 'e.g., "Sleeve"',
  exporting: 'Exporting...',
  dateRange: 'Date Range',

  // Trash / Recently Deleted Modal
  trash: {
    title: 'Recently Deleted',
    description: 'Items in the trash will be permanently deleted after 7 days. You can restore them or delete them forever.',
    restore: 'Restore',
    deleteForever: 'Delete Forever',
    empty: 'Trash is empty.',
    archiveSessions: 'Archive Sessions...',
    daysRemaining: '{count} days remaining',
    deletedOn: 'Deleted on {date}',
    permanentDeleteWarning: 'This action is permanent and cannot be undone.',
    restoreSessionConfirmation: 'Are you sure you want to restore this session?',
    deleteSessionConfirmation: 'Are you sure you want to permanently delete this session?',
  },
  
  // Munshi Ji Screen
  munshi: {
    title: 'Munshi Ji',
    description: 'Ask Munshi Ji to get insights from your work data.',
    placeholder: 'Ask Munshi Ji...',
    send: 'Send',
    loading: 'Calculating...',
    error: 'An error occurred. Please try again.',
    suggestionWeeklySummary: 'Show me this week\'s account.',
    suggestionMostProfitable: 'Which cloth is most profitable?',
    suggestionBestDay: 'When was my best earning day this week?',
    suggestionGoalProgress: 'How far am I from my goal?',
    suggestionMostPieces: 'When did I cut the most pieces?',
    suggestionMonthlyEarning: 'What are my total earnings this month?',
  },
};

const hi: Strings = {
  ...en, // Start with English and override
  // General
  title: 'Garment Tracker',
  save: 'Save Karein',
  cancel: 'Cancel Karein',
  delete: 'Delete Karein',
  total: 'Total',
  from: 'Se',
  to: 'Tak',
  users: 'Users',
  selectAll: 'Sab Select Karein',
  deselectAll: 'Sab Deselect Karein',
  english: 'English',
  hinglish: 'Hinglish',
  hindi: 'Hindi',

  // Navigation
  trackerNav: 'Tracker',
  logNav: 'Log',
  munshiNav: 'Munshi Ji',

  // Setup Screen
  setup: {
    welcomeTitle: 'Garment Tracker Mein Swagat Hai',
    welcomeMessage: 'Apne kaam, kamai, aur daily progress ko track karne ka saral tarika. Chaliye shuru karein.',
    getStarted: 'Shuru Karein',
    nameTitle: 'Hum aapko kya bulayein?',
    namePrompt: 'Yeh aapke work profile ko pehchanne ke liye istemal hoga.',
    namePlaceholder: 'Jaise, Rahul',
    continue: 'Jaari Rakhein',
    languageTitle: 'Apni Bhasha Chunein',
    languagePrompt: 'App ke liye apni pasand ki bhasha chunein.',
  },
  
  // Tracker Screen
  addEntryButton: 'Entry Jodein',
  manageCategories: 'Categories Manage Karein',
  deleteCategory: 'Category delete karein',
  addPresets: 'Preset se jodein',
  addCategory: 'Ya custom category jodein',
  categoryNamePlaceholder: 'Category ka Naam',
  deleteCategoryConfirmation: 'Kya aap "{categoryName}" category ko delete karna chahte hain? Isse undo nahi kiya ja sakta.',
  startFirstSession: 'Pehla Session Shuru Karein',
  createFirstPreset: 'Pehla Preset Banayein',
  noPresetsWelcome: 'Apni kamai track karne ke liye rates ke saath "cloth type" presets banane ke liye Log screen par jayein.',
  selectClothType: 'Kapde ka Type Chunein',
  manageClothTypes: 'Cloth Types Manage Karein',
  clothTypeSelection: 'Kapde ka Type / Session',
  addSession: 'Naya Session',
  
  // Summary
  sessionSummary: 'Session ka Summary',
  categoryBreakdown: 'Category Breakdown',
  grandTotal: 'Total Pieces',

  // Entries List
  deleteEntry: 'Delete',
  noEntries: 'Is session ke liye koi entry record nahi ki gayi hai.',
  recentEntries: 'Haal ki Entries',

  // Log Screen
  logTitle: 'Work Log',
  noRecords: 'Koi work record nahi mila.',
  exportData: 'Data Export Karein',
  manageTrash: 'Trash Manage Karein',
  selectLanguageTitle: 'Bhasha Chunein',
  
  // Earnings Tracker
  earningsGoal: 'Kamai ka Lakshya',
  editGoal: 'Lakshya Edit Karein',
  resetProgress: 'Progress Reset Karein',
  setGoal: 'Kamai ka Lakshya Set Karein',
  enterEarningsGoal: 'Apne progress ko track karne ke liye apna target kamai amount enter karein.',
  resetEarningsConfirmationTitle: 'Kamai ki Progress Reset Karein?',
  resetEarningsConfirmationBody: 'Yeh aapke earnings tracker ko zero se shuru kar dega. Aapke purane work logs delete nahi honge.',
  slideToConfirm: 'Confirm karne ke liye slide karein',
  
  // Manage Presets Modal
  clothTypePresets: 'Cloth Type Presets',
  clothTypeName: 'Kapde ka type naam',
  ratePerPiece: 'Rate per piece (₹)',
  editPreset: 'Preset edit karein',
  deletePreset: 'Preset delete karein',
  noPresets: 'Abhi tak koi preset nahi banaya gaya hai.',
  addPreset: 'Naya Preset Jodein',
  newPresetName: 'Jaise, Shirt Front',
  deletePresetConfirmation: 'Kya aap "{presetName}" preset ko delete karna chahte hain?',
  
  // Select Preset Modal
  goToLogScreenToAdd: 'Kuch presets jodne ke liye Log screen par jayein.',
  
  // Archive Modal (Previously Delete)
  archiveTitle: 'Sessions Archive Karein',
  archiveDescription: 'Date range select karein aur chunein ki kaun se work sessions ko trash mein bhejna hai.',
  sessionsInDateRange: 'Date Range mein Sessions',
  noSessionsFound: 'Chune gaye date range mein koi session nahi mila.',
  archiveConfirmation: 'Yeh {count} session(s) ko trash mein bhej dega, jahan 7 din baad woh hamesha ke liye delete ho jayenge. Confirm karne ke liye ARCHIVE type karein.',
  archiveSelected: 'Chune Hue Archive Karein',
  
  // Export Modal
  exportDataTitle: 'Work Data Export Karein',
  exportDataDescription: 'Chune gaye filters ke aadhar par apne work data ki report generate karein.',
  exportFormat: 'Export Format',
  exportFormatPdf: 'PDF Report',
  exportFormatCsv: 'Image Card',
  sessionNameFilter: 'Cloth Type Naam se Filter Karein',
  sessionNameFilterPlaceholder: 'Jaise, "Sleeve"',
  exporting: 'Export ho raha hai...',
  dateRange: 'Date Range',

  // Trash / Recently Deleted Modal
  trash: {
    title: 'Haal hi Mein Delete Kiye Gaye',
    description: 'Trash mein items 7 din baad hamesha ke liye delete ho jayenge. Aap unhe restore kar sakte hain ya hamesha ke liye delete kar sakte hain.',
    restore: 'Restore Karein',
    deleteForever: 'Hamesha Ke Liye Delete Karein',
    empty: 'Trash khaali hai.',
    archiveSessions: 'Sessions Archive Karein...',
    daysRemaining: '{count} din bache hain',
    deletedOn: '{date} ko delete kiya gaya',
    permanentDeleteWarning: 'Yeh action permanent hai aur undo nahi kiya ja sakta.',
    restoreSessionConfirmation: 'Kya aap is session ko restore karna chahte hain?',
    deleteSessionConfirmation: 'Kya aap is session ko hamesha ke liye delete karna chahte hain?',
  },
  
  // Munshi Ji Screen
  munshi: {
    title: 'Munshi Ji',
    description: 'Munshi Ji se apne kaam ki jaankari ke liye poochein.',
    placeholder: 'Munshi Ji se poochein...',
    send: 'Bhejein',
    loading: 'Hisaab laga raha hai...',
    error: 'Ek galti ho gayi. Kripya phir se koshish karein.',
    suggestionWeeklySummary: 'Is hafte ka hisaab dikhao.',
    suggestionMostProfitable: 'Sabse faydemand kapda kaunsa hai?',
    suggestionBestDay: 'Is hafte sabse acchi kamai kab hui?',
    suggestionGoalProgress: 'Main apne lakshya se kitna door hoon?',
    suggestionMostPieces: 'Maine sabse zyada piece kab kaate?',
    suggestionMonthlyEarning: 'Is mahine ki kul kamai kitni hai?',
  },
};

const hn: Strings = {
  // General
  title: 'गारमेंट ट्रैकर',
  save: 'सहेजें',
  cancel: 'रद्द करें',
  delete: 'हटाएं',
  total: 'कुल',
  from: 'से',
  to: 'तक',
  users: 'उपयोगकर्ता',
  selectAll: 'सभी चुनें',
  deselectAll: 'सभी अचयनित करें',
  english: 'इंग्लिश',
  hinglish: 'हिंग्लिश',
  hindi: 'हिन्दी',

  // Navigation
  trackerNav: 'ट्रैकर',
  logNav: 'लॉग',
  munshiNav: 'मुंशी जी',

  // Setup Screen
  setup: {
    welcomeTitle: 'गारमेंट ट्रैकर में आपका स्वागत है',
    welcomeMessage: 'अपने काम, कमाई और दैनिक प्रगति को ट्रैक करने का सरल तरीका। चलिए आपको सेट अप करते हैं।',
    getStarted: 'शुरू करें',
    nameTitle: 'हम आपको क्या कहें?',
    namePrompt: 'यह आपके कार्य प्रोफ़ाइल की पहचान करने के लिए उपयोग किया जाएगा।',
    namePlaceholder: 'उदा., राहुल',
    continue: 'जारी रखें',
    languageTitle: 'अपनी भाषा चुनें',
    languagePrompt: 'ऐप के लिए अपनी पसंदीदा भाषा चुनें।',
  },

  // Categories
  okCategory: 'OK',
  reworkCategory: 'Rework',
  oilCategory: 'Oil',
  adasCategory: 'Adas',
  yarnCategory: 'धागा',
  secondOkCategory: 'दूसरा ठीक',

  // Tracker Screen
  addEntryButton: 'एंट्री जोड़ें',
  manageCategories: 'श्रेणियां प्रबंधित करें',
  deleteCategory: 'श्रेणी हटाएं',
  addPresets: 'प्रीसेट से जोड़ें',
  addCategory: 'या एक कस्टम श्रेणी जोड़ें',
  categoryNamePlaceholder: 'श्रेणी का नाम',
  deleteCategoryConfirmation: 'क्या आप वाकई "{categoryName}" श्रेणी को हटाना चाहते हैं? यह पूर्ववत नहीं किया जा सकता।',
  startFirstSession: 'अपना पहला सत्र शुरू करें',
  createFirstPreset: 'अपना पहला प्रीसेट बनाएं',
  noPresetsWelcome: 'अपनी कमाई को ट्रैक करने के लिए दरों के साथ "कपड़े के प्रकार" प्रीसेट बनाने के लिए लॉग स्क्रीन पर जाएं।',
  selectClothType: 'कपड़े का प्रकार चुनें',
  manageClothTypes: 'कपड़े के प्रकार प्रबंधित करें',
  clothTypeSelection: 'कपड़े का प्रकार / सत्र',
  addSession: 'नया सत्र',

  // Summary
  sessionSummary: 'सत्र का सारांश',
  categoryBreakdown: 'श्रेणी का विवरण',
  grandTotal: 'कुल पीस',

  // Entries List
  deleteEntry: 'हटाएं',
  noEntries: 'इस सत्र के लिए अभी तक कोई प्रविष्टि दर्ज नहीं की गई है।',
  recentEntries: 'हाल की प्रविष्टियाँ',

  // Log Screen
  logTitle: 'कार्य लॉग',
  noRecords: 'कोई कार्य रिकॉर्ड नहीं मिला।',
  exportData: 'डेटा निर्यात करें',
  manageTrash: 'ट्रैश प्रबंधित करें',
  selectLanguageTitle: 'भाषा चुनें',
  
  // Earnings Tracker
  earningsGoal: 'कमाई का लक्ष्य',
  editGoal: 'लक्ष्य संपादित करें',
  resetProgress: 'प्रगति रीसेट करें',
  setGoal: 'कमाई का लक्ष्य निर्धारित करें',
  enterEarningsGoal: 'अपनी प्रगति को ट्रैक करने के लिए अपनी लक्ष्य कमाई राशि दर्ज करें।',
  resetEarningsConfirmationTitle: 'कमाई की प्रगति रीसेट करें?',
  resetEarningsConfirmationBody: 'यह आपके कमाई ट्रैकर को शून्य पर रीसेट कर देगा, जो अभी से शुरू होगा। आपके पिछले कार्य लॉग हटाए नहीं जाएंगे।',
  slideToConfirm: 'पुष्टि करने के लिए स्लाइड करें',
  
  // Manage Presets Modal
  clothTypePresets: 'कपड़े के प्रकार के प्रीसेट',
  clothTypeName: 'कपड़े का प्रकार नाम',
  ratePerPiece: 'प्रति पीस दर (₹)',
  editPreset: 'प्रीसेट संपादित करें',
  deletePreset: 'प्रीसेट हटाएं',
  noPresets: 'अभी तक कोई प्रीसेट नहीं बनाया गया है।',
  addPreset: 'नया प्रीसेट जोड़ें',
  newPresetName: 'उदा., शर्ट फ्रंट',
  deletePresetConfirmation: 'क्या आप वाकई "{presetName}" प्रीसेट को हटाना चाहते हैं?',

  // Select Preset Modal
  goToLogScreenToAdd: 'कुछ जोड़ने के لیے लॉग स्क्रीन पर जाएं।',

  // Archive Modal (Previously Delete)
  archiveTitle: 'सत्र संग्रहीत करें',
  archiveDescription: 'एक तिथि सीमा चुनें और चुनें कि कौन से कार्य सत्र ट्रैश में ले जाने हैं।',
  sessionsInDateRange: 'तिथि सीमा में सत्र',
  noSessionsFound: 'चयनित तिथि सीमा में कोई सत्र नहीं मिला।',
  archiveConfirmation: 'यह {count} सत्र(स) को ट्रैश में ले जाएगा, जहां वे 7 दिनों के बाद स्थायी रूप से हटा दिए जाएंगे। पुष्टि करने के लिए ARCHIVE टाइप करें।',
  archiveSelected: 'चयनित संग्रहीत करें',
  
  // Export Modal
  exportDataTitle: 'कार्य डेटा निर्यात करें',
  exportDataDescription: 'चयनित फ़िल्टर के आधार पर अपने कार्य डेटा की एक रिपोर्ट तैयार करें।',
  exportFormat: 'निर्यात प्रारूप',
  exportFormatPdf: 'पीडीएफ रिपोर्ट',
  exportFormatCsv: 'छवि कार्ड',
  sessionNameFilter: 'कपड़े के प्रकार के नाम से फ़िल्टर करें',
  sessionNameFilterPlaceholder: 'उदा., "आस्तीन"',
  exporting: 'निर्यात हो रहा है...',
  dateRange: 'तिथि सीमा',

  // Trash / Recently Deleted Modal
  trash: {
    title: 'हाल ही में हटाए गए',
    description: 'ट्रैश में आइटम 7 दिनों के बाद स्थायी रूप से हटा दिए जाएंगे। आप उन्हें पुनर्स्थापित कर सकते हैं या हमेशा के लिए हटा सकते हैं।',
    restore: 'पुनर्स्थापित करें',
    deleteForever: 'हमेशा के लिए हटाएं',
    empty: 'ट्रैश खाली है।',
    archiveSessions: 'सत्र संग्रहीत करें...',
    daysRemaining: '{count} दिन शेष',
    deletedOn: '{date} को हटाया गया',
    permanentDeleteWarning: 'यह क्रिया स्थायी है और इसे पूर्ववत नहीं किया जा सकता।',
    restoreSessionConfirmation: 'क्या आप वाकई इस सत्र को पुनर्स्थापित करना चाहते हैं?',
    deleteSessionConfirmation: 'क्या आप वाकई इस सत्र को स्थायी रूप से हटाना चाहते हैं?',
  },

  // Munshi Ji Screen
  munshi: {
    title: 'मुंशी जी',
    description: 'मुंशी जी से अपने काम की जानकारी के लिए पूछें।',
    placeholder: 'मुंशी जी से पूछें...',
    send: 'भेजें',
    loading: 'हिसाब लगा रहा है...',
    error: 'एक त्रुटि हुई। कृपया पुन: प्रयास करें।',
    suggestionWeeklySummary: 'इस सप्ताह का हिसाब दिखाओ।',
    suggestionMostProfitable: 'सबसे फायदेमंद कपड़ा कौनसा है?',
    suggestionBestDay: 'इस सप्ताह सबसे अच्छी कमाई कब हुई?',
    suggestionGoalProgress: 'मैं अपने लक्ष्य से कितना दूर हूं?',
    suggestionMostPieces: 'मैंने सबसे ज्यादा पीस कब काटे?',
    suggestionMonthlyEarning: 'इस महीने की कुल कमाई कितनी है?',
  },
};

export const APP_STRINGS = { en, hi, hn };

export const getStrings = (lang: Language = 'en'): Strings => {
  return APP_STRINGS[lang] || APP_STRINGS.en;
};

export const getDefaultCategories = (strings: Strings) => [
    strings.okCategory,
    strings.reworkCategory,
    strings.oilCategory,
    strings.adasCategory,
];

export const getCategoryStyles = (strings: Strings) => ({
    [strings.okCategory]: { color: 'var(--accent)' },
    [strings.reworkCategory]: { color: 'var(--rework-color)' },
    [strings.adasCategory]: { color: 'var(--adas-color)' },
    [strings.oilCategory]: { color: 'var(--oil-color)' },
    [strings.yarnCategory]: { color: 'var(--yarn-color)' },
    [strings.secondOkCategory]: { color: 'var(--second-ok-color)' },
});