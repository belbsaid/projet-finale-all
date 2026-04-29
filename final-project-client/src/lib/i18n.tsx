'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

type Lang = 'fr' | 'ar';

// ─── Translation dictionaries ──────────────────────────
const translations = {
  fr: {
    // Nav
    home: 'Accueil',
    cars: 'Voitures',
    brands: 'Marques',
    contact: 'Contact',
    myAccount: 'Mon Compte',
    myCars: 'Mes Voitures',
    myDocuments: 'Mes Documents',
    login: 'Connexion',
    register: 'Inscription',
    logout: 'Déconnexion',

    // Hero
    heroTitle: 'Voitures Neuves de Chine',
    heroSubtitle: 'Garantie Officielle',
    heroDesc: 'Importateur Agréé · Pièces Détachées · Service Après-Vente à Alger',
    reserveVisit: 'Réserver une Visite',
    discoverCars: 'Découvrir nos Voitures',

    // Sections
    featuredCars: 'Voitures en Stock',
    featuredCarsSubtitle: 'Découvrez notre sélection de véhicules disponibles immédiatement',
    ourBrands: 'Nos Marques',
    ourBrandsSubtitle: 'Les meilleures marques chinoises importées officiellement en Algérie',
    whyChooseUs: 'Pourquoi Nous Choisir ?',

    // Value props
    officialImport: 'Importation Légale',
    officialImportDesc: 'Tous nos véhicules sont importés en conformité avec la réglementation algérienne',
    officialService: 'Service Officiel',
    officialServiceDesc: 'Centre de service agréé à Alger avec des techniciens certifiés',
    genuineParts: 'Pièces Disponibles',
    genuinePartsDesc: 'Stock de pièces d\'origine pour toutes les marques que nous importons',

    // Car card
    viewDetails: 'Voir Détails',
    contactWhatsApp: 'Contacter sur WhatsApp',
    contactForCar: 'Contacter pour cette voiture',
    trackOrder: 'Suivre ma Commande',
    inStock: 'En Stock',
    inTransit: 'En Transit',
    reserved: 'Réservé',
    sold: 'Vendu',

    // Forms
    name: 'Nom Complet',
    email: 'Email',
    phone: 'Téléphone (+213...)',
    password: 'Mot de Passe',
    message: 'Message',
    interestedModel: 'Modèle qui vous intéresse',
    submit: 'Envoyer',
    submitting: 'Envoi en cours...',
    send: 'Envoyer',
    loginBtn: 'Se Connecter',
    registerBtn: "S'inscrire",
    noAccount: 'Pas encore de compte ?',
    hasAccount: 'Déjà un compte ?',

    // VIN
    vinLookup: 'Suivi de Commande',
    vinTitle: 'Suivre mon Véhicule',
    vinDesc: 'Entrez le VIN de votre véhicule pour suivre son statut en temps réel',
    vinInput: 'Numéro VIN (17 caractères)',
    vinSearch: 'Rechercher',
    vinSearching: 'Recherche...',
    vinNotFound: 'Véhicule non trouvé ou vous n\'avez pas accès à ces informations',
    loginRequired: 'Connexion Requise',
    loginRequiredDesc: 'Veuillez vous connecter pour accéder au suivi de commande',

    // Account
    dashboard: 'Tableau de Bord',
    welcomeBack: 'Bienvenue,',
    noOrderYet: 'Aucune commande pour le moment',
    noOrderDesc: 'Vous n\'avez pas encore de véhicule associé à votre compte',

    // Contact
    contactTitle: 'Contactez-Nous',
    contactSubtitle: 'Nous sommes là pour vous aider',
    address: 'Adresse',
    workingHours: 'Horaires',
    workingHoursVal: 'Lun–Sam : 08h30 – 17h30',

    // Meeting
    bookMeeting: 'Réserver une Visite',
    bookMeetingDesc: 'Choisissez une date et un créneau pour visiter notre showroom à Alger',
    preferredDate: 'Date Préférée',
    timeSlot: 'Créneau Horaire',
    morning: 'Matin (09h–12h)',
    afternoon: 'Après-midi (13h–17h)',
    evening: 'Soirée (17h–19h)',
    notes: 'Notes supplémentaires',
    bookNow: 'Confirmer la Réservation',

    // Service
    bookService: 'Réserver un Service',
    serviceDesc: 'Planifiez votre entretien au centre de service agréé d\'Alger',

    // Misc
    loading: 'Chargement...',
    error: 'Une erreur est survenue',
    retry: 'Réessayer',
    seeAll: 'Voir tout',
    back: 'Retour',
    year: 'Année',
    color: 'Couleur',
    engine: 'Moteur',
    transmission: 'Transmission',
    fuelType: 'Carburant',
    fuelConsumption: 'Consommation',
    warranty: 'Garantie',
    features: 'Équipements',
    price: 'Prix',
    finalPrice: 'Prix Final',
    discount: 'Remise',
    specifications: 'Spécifications',
    carNotes: 'Notes Client',
    expectedDelivery: 'Livraison Prévue',
    arrivalDate: 'Date d\'Arrivée',
    statusHistory: 'Historique',
    stockNumber: 'N° Stock',
    vin: 'VIN',
  },
  ar: {
    // Nav
    home: 'الرئيسية',
    cars: 'السيارات',
    brands: 'الماركات',
    contact: 'اتصل بنا',
    myAccount: 'حسابي',
    myCars: 'سياراتي',
    myDocuments: 'وثائقي',
    login: 'تسجيل الدخول',
    register: 'التسجيل',
    logout: 'تسجيل الخروج',

    // Hero
    heroTitle: 'سيارات صينية جديدة',
    heroSubtitle: 'ضمان رسمي',
    heroDesc: 'مستورد معتمد · قطع الغيار · خدمة ما بعد البيع في الجزائر',
    reserveVisit: 'حجز زيارة',
    discoverCars: 'اكتشف سياراتنا',

    // Sections
    featuredCars: 'السيارات المتوفرة',
    featuredCarsSubtitle: 'اكتشف مجموعتنا من السيارات المتاحة للتسليم الفوري',
    ourBrands: 'ماركاتنا',
    ourBrandsSubtitle: 'أفضل الماركات الصينية المستوردة رسمياً إلى الجزائر',
    whyChooseUs: 'لماذا تختارنا؟',

    // Value props
    officialImport: 'استيراد قانوني',
    officialImportDesc: 'جميع مركباتنا مستوردة وفقاً للأنظمة الجزائرية',
    officialService: 'خدمة رسمية',
    officialServiceDesc: 'مركز خدمة معتمد في الجزائر العاصمة مع تقنيين مؤهلين',
    genuineParts: 'قطع متوفرة',
    genuinePartsDesc: 'قطع غيار أصلية لجميع الماركات التي نستوردها',

    // Car card
    viewDetails: 'عرض التفاصيل',
    contactWhatsApp: 'تواصل عبر واتساب',
    contactForCar: 'تواصل بخصوص هذه السيارة',
    trackOrder: 'تتبع طلبي',
    inStock: 'في المخزون',
    inTransit: 'في العبور',
    reserved: 'محجوز',
    sold: 'مباع',

    // Forms
    name: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف (+213...)',
    password: 'كلمة المرور',
    message: 'الرسالة',
    interestedModel: 'الموديل الذي يهمك',
    submit: 'إرسال',
    submitting: 'جاري الإرسال...',
    send: 'إرسال',
    loginBtn: 'تسجيل الدخول',
    registerBtn: 'التسجيل',
    noAccount: 'ليس لديك حساب؟',
    hasAccount: 'لديك حساب بالفعل؟',

    // VIN
    vinLookup: 'تتبع الطلب',
    vinTitle: 'تتبع سيارتي',
    vinDesc: 'أدخل رقم VIN لتتبع حالة سيارتك في الوقت الفعلي',
    vinInput: 'رقم VIN (17 حرفاً)',
    vinSearch: 'بحث',
    vinSearching: 'جاري البحث...',
    vinNotFound: 'السيارة غير موجودة أو ليس لديك صلاحية الوصول',
    loginRequired: 'يجب تسجيل الدخول',
    loginRequiredDesc: 'يرجى تسجيل الدخول للوصول إلى تتبع الطلب',

    // Account
    dashboard: 'لوحة التحكم',
    welcomeBack: 'مرحباً،',
    noOrderYet: 'لا توجد طلبات حتى الآن',
    noOrderDesc: 'ليس لديك مركبة مرتبطة بحسابك حتى الآن',

    // Contact
    contactTitle: 'تواصل معنا',
    contactSubtitle: 'نحن هنا لمساعدتك',
    address: 'العنوان',
    workingHours: 'ساعات العمل',
    workingHoursVal: 'الإثنين–السبت: 08:30 – 17:30',

    // Meeting
    bookMeeting: 'حجز زيارة',
    bookMeetingDesc: 'اختر تاريخاً وموعداً لزيارة صالة العرض في الجزائر',
    preferredDate: 'التاريخ المفضل',
    timeSlot: 'الفترة الزمنية',
    morning: 'صباحاً (09:00–12:00)',
    afternoon: 'بعد الظهر (13:00–17:00)',
    evening: 'مساءً (17:00–19:00)',
    notes: 'ملاحظات إضافية',
    bookNow: 'تأكيد الحجز',

    // Service
    bookService: 'حجز خدمة',
    serviceDesc: 'خطط لصيانتك في مركز الخدمة المعتمد بالجزائر',

    // Misc
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    retry: 'إعادة المحاولة',
    seeAll: 'عرض الكل',
    back: 'رجوع',
    year: 'السنة',
    color: 'اللون',
    engine: 'المحرك',
    transmission: 'ناقل الحركة',
    fuelType: 'نوع الوقود',
    fuelConsumption: 'استهلاك الوقود',
    warranty: 'الضمان',
    features: 'المميزات',
    price: 'السعر',
    finalPrice: 'السعر النهائي',
    discount: 'الخصم',
    specifications: 'المواصفات',
    carNotes: 'ملاحظات العميل',
    expectedDelivery: 'التسليم المتوقع',
    arrivalDate: 'تاريخ الوصول',
    statusHistory: 'السجل',
    stockNumber: 'رقم المخزون',
    vin: 'رقم الهيكل',
  },
} as const;

type TranslationKey = keyof typeof translations.fr;

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null;
    if (stored === 'fr' || stored === 'ar') setLangState(stored);
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
    document.documentElement.setAttribute('lang', newLang);
    document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => translations[lang][key] ?? translations.fr[key],
    [lang]
  );

  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
