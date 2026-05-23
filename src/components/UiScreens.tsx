/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Star, Clock, Flame, Heart, ShoppingBag, Plus, Minus, Check, 
  MapPin, ShieldCheck, ChevronRight, Bell, Trash2, ArrowLeft, RotateCcw, 
  Languages, Moon, Sun, Award, Globe, Phone, Gift, ArrowRight, Compass,
  MapIcon, CreditCard, Play, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppScreen, FoodItem, CartItem, UserAddress, OrderHistoryItem, AppNotification } from '../types';
import { FOOD_ITEMS, SAVED_ADDRESSES, INITIAL_ORDER_HISTORY } from '../data';

interface ScreenProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  language: 'en' | 'te';
  setLanguage: (lang: 'en' | 'te') => void;
  isDarkMode: boolean;
  setIsDarkMode: (mode: boolean) => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  selectedFoodId: string | null;
  setSelectedFoodId: (id: string | null) => void;
  userAddressList: UserAddress[];
  setUserAddressList: React.Dispatch<React.SetStateAction<UserAddress[]>>;
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
  activeOrderStep: number;
  setActiveOrderStep: React.Dispatch<React.SetStateAction<number>>;
  orderPlacedTotal: number;
  setOrderPlacedTotal: (total: number) => void;
  userName: string;
  setUserName: (name: string) => void;
  userAvatar: string;
  setUserAvatar: (avatar: string) => void;
  orderHistory: OrderHistoryItem[];
  setOrderHistory: React.Dispatch<React.SetStateAction<OrderHistoryItem[]>>;
  firebaseUser?: any | null;
  firebaseLoading?: boolean;
  onGoogleSignIn?: () => Promise<any>;
  onSignOut?: () => Promise<void>;
}

// ----------------------------------------------------
// TRANSLATION DICTIONARY
// ----------------------------------------------------
const TEXTS = {
  en: {
    tagline: 'Crave Your Recipe Anytime',
    startCravings: 'Start Biting ✨',
    onboard1_title: 'Fresh food delivered with love',
    onboard1_desc: 'Cozy morning atmosphere. Every bite made with fresh organic farm grains and premium ingredients.',
    onboard2_title: 'Fast delivery, warm happiness',
    onboard2_desc: 'Our friendly riders deliver in insulated cozy carrier packages to preserve hot deliciousness.',
    onboard3_title: 'Cravings solved anytime',
    onboard3_desc: 'Late-night cravings or heavy office mornings? Cyra Bites has your warm comfort menu ready.',
    loginTitle: 'Welcome to Cyra Bites',
    loginSubtitle: 'Let us connect you to cozy bites',
    phoneNumber: 'Phone Number',
    googleLogin: 'Sign in with Google',
    otpTitle: 'Verify Code',
    otpSubtitle: 'Sent 4-digit code to your mobile',
    confirmCode: 'Get Started 🌟',
    popular: 'Popular Near You 🏷️',
    healthy: 'Healthy Choices 🥦',
    quick: 'Quick Delivery (Under 15m) ⚡',
    searchPlaceholder: 'Search delicious recipes...',
    calories: 'Calories',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    ingredientsTitle: 'Warm Ingredients',
    reviews: 'Reviews',
    addToCart: 'Add to Cart 🛒',
    addedToCart: 'In Cart 💖',
    cartTitle: 'My Cozy Order 🍔',
    emptyCart: 'Your order list is empty and feeling cold. Add cozy bites!',
    couponSection: 'Have a happiness coupon?',
    applyBtn: 'Apply',
    priceBreakdown: 'Bill Details',
    itemTotal: 'Item Total',
    deliveryFee: 'Happiness Delivery',
    taxes: 'Cooking Care & Tax',
    couponDiscount: 'Love Discount',
    grandTotal: 'Grand Total',
    proceedCheckout: 'Proceed to Payment 💖',
    savedAddresses: 'Select Saved Address',
    addNewAddress: 'Add Custom Address ➕',
    gpsSuccess: 'GPS Location Synced Successfully ✅',
    paymentTitle: 'Secure Checkout 🔐',
    paymentSub: 'Select payment method',
    payWithCard: 'Premium Magic Glowing Card',
    cod: 'Cash on Delivery 💵',
    upiPhonePe: 'PhonePe UPI',
    upiGpay: 'Google Pay',
    paytm: 'Paytm Wallet',
    placeOrder: 'Confirm and Cook 🍕',
    trackingTitle: 'Joy Tracker 🛵',
    trackSub: 'Fasten your seatbelt, comfort is coming!',
    etaText: 'arriving sweet and warm',
    orderStat_prep: 'Preparing with Love 🍳',
    orderStat_picked: 'Picked up by Rider 📦',
    orderStat_way: 'On the Way (Scooter flying) 🛵',
    orderStat_delivered: 'Delivered of pure joy! 🎉',
    favTitle: 'My Heart Choices 💖',
    favEmpty: 'Your favorites page is empty. Tap hearts on foods!',
    profileTitle: 'My Cyra Profile 🌸',
    languageLabel: 'Switch App Language',
    darkModeLabel: 'Cozy Night Mode',
    orderHistory: 'My Fast History 📜',
    rewardsText: 'Cyra Sparkle Points',
    memberTier: 'Panda Tier Member 🐼',
    english: 'English 🇬🇧',
    telugu: 'Telugu 🇮🇳',
    paymentSuccess: 'Order Placed Successfully! 🎉',
    rideStart: 'Rider is zooming across Jubilee Hills!',
    reorderBtn: 'Reorder Again'
  },
  te: {
    tagline: 'నెయ్యి పరిమళాలు.. ప్రతి క్షణం మీ కోసమే!',
    startCravings: 'ప్రయాణం ప్రారంభించండి ✨',
    onboard1_title: 'ప్రేమతో వడ్డించిన తాజా ఆహారం',
    onboard1_desc: 'కోరుకున్న రుచులు, మనసుకు నచ్చేలా తాజా సేంద్రీయ దినుసులతో తయారుచేయబడినవి.',
    onboard2_title: 'వేగవంతమైన డెలివరీ, వెచ్చని ఆనందం',
    onboard2_desc: 'మా స్నేహపూర్వక రైడర్లు మీ ఆహారం వేడి తగ్గకుండా సురక్షితమైన పెట్టెల్లో అందిస్తారు.',
    onboard3_title: 'ఆకలి తీర్చే అమృతం, ఎప్పుడైనా!',
    onboard3_desc: 'రాత్రి సమయమైనా, బిజీ ఆఫీస్ ఉదయమైనా.. సైరా బైట్స్ మీ సేవలో సిద్ధం.',
    loginTitle: 'సైరా బైట్స్‌కు స్వాగతం',
    loginSubtitle: 'మీకు నచ్చిన రుచికరమైన ప్రపంచంతో కనెక్ట్ అవ్వండి',
    phoneNumber: 'ఫోన్ నంబర్',
    googleLogin: 'గూగుల్ ద్వారా లాగిన్',
    otpTitle: 'ఓటిపి వెరిఫికేషన్',
    otpSubtitle: 'మీ మొబైల్‌కు 4-అంకెల కోడ్ పంపబడింది',
    confirmCode: 'ప్రారంభించండి 🌟',
    popular: 'మీ చుట్టుపక్కల ప్రాచుర్యం పొందినవి 🏷️',
    healthy: 'ఆరోగ్యకరమైన రుచులు 🥦',
    quick: 'త్వరిత డెలివరీ (15 ని॥ లోపు) ⚡',
    searchPlaceholder: 'రుచికరమైన వంటకాలను వెతకండి...',
    calories: 'క్యాలరీలు',
    protein: 'ప్రోటీన్లు',
    carbs: 'కార్బోహైడ్రేట్లు',
    fat: 'కొవ్వులు',
    ingredientsTitle: 'కావలసిన పదార్థాలు',
    reviews: 'సమీక్షలు',
    addToCart: 'ఆర్డర్‌కు జోడించు 🛒',
    addedToCart: 'ఆర్డర్‌లో ఉంది 💖',
    cartTitle: 'నా రుచికరమైన ఆర్డర్ 🍔',
    emptyCart: 'మీ ఆర్డర్ ఖాళీగా ఉంది. రుచికరమైన ఆహారాన్ని జోడించండి!',
    couponSection: 'కూపన్ కోడ్ ఉందా?',
    applyBtn: 'వర్తింపచేయి',
    priceBreakdown: 'బిల్లు వివరాలు',
    itemTotal: 'ఆహార పదార్థాల ధర',
    deliveryFee: 'డెలివరీ ఛార్జీలు',
    taxes: 'వంట సంరక్షణ & పన్ను',
    couponDiscount: 'లవ్ డిస్కౌంట్',
    grandTotal: 'మొత్తం ధర',
    proceedCheckout: 'చెల్లింపునకు వెళ్ళండి 💖',
    savedAddresses: 'చిరునామాను ఎంచుకోండి',
    addNewAddress: 'కొత్త చిరునామాను జోడించండి ➕',
    gpsSuccess: 'జిపిఎస్ విజయవంతంగా అనుసంధానించబడింది ✅',
    paymentTitle: 'సురక్షిత చెల్లింపు 🔐',
    paymentSub: 'చెల్లింపు పద్ధతిని ఎంచుకోండి',
    payWithCard: 'ప్రీమియం గ్లోయింగ్ కార్డ్',
    cod: 'క్యాష్ ఆన్ డెలివరీ 💵',
    upiPhonePe: 'ఫోన్‌పే యూపీఐ',
    upiGpay: 'గూగుల్ పే',
    paytm: 'పేటీఎం వాలెట్',
    placeOrder: 'ఆర్డర్ ఖరారు చేయండి 🍕',
    trackingTitle: 'డెలివరీ ట్రాకర్ 🛵',
    trackSub: 'మీకు ఇష్టమైన రుచికరమైన ఆహారం వంట గది నుండి బయలుదేరింది!',
    etaText: 'త్వరの中で వేడి వేడిగా అందుతుంది',
    orderStat_prep: 'ప్రేమతో తయారుచేస్తున్నారు 🍳',
    orderStat_picked: 'రైడర్ ఆర్డర్ తీసుకున్నారు 📦',
    orderStat_way: 'దారిలో ఉన్నారు (స్కూటర్ వేగంగా వస్తోంది) 🛵',
    orderStat_delivered: 'ఆనందంగా డెలివరీ చేయబడింది! 🎉',
    favTitle: 'నా ప్రియమైన రుచులు 💖',
    favEmpty: 'మీకు ఇష్టమైన వంటకాల జాబితా ఖాళీగా ఉంది. హార్ట్ బటన్ నొక్కండి!',
    profileTitle: 'నా ప్రొఫైల్ 🌸',
    languageLabel: 'భాష మార్చుకోండి',
    darkModeLabel: 'కార్యాలయం నైట్ మోడ్',
    orderHistory: 'నా ఆర్డర్ల చరిత్ర 📜',
    rewardsText: 'సైరా మెరిసే పాయింట్లు',
    memberTier: 'పాండా శ్రేణి సభ్యులు 🐼',
    english: 'ఇంగ్లీష్ 🇬🇧',
    telugu: 'తెలుగు 🇮🇳',
    paymentSuccess: 'ఆర్డర్ విజయవంతంగా పూర్తయింది! 🎉',
    rideStart: 'రైడర్ జూబ్లీ హిల్స్ మీదుగా వేగంగా దూసుకుపోతున్నారు!',
    reorderBtn: 'మళ్ళీ ఆర్డర్ చేసుకోండి'
  }
};

export const UiScreens: React.FC<ScreenProps> = ({
  currentScreen,
  onNavigate,
  language,
  setLanguage,
  isDarkMode,
  setIsDarkMode,
  cart,
  setCart,
  favorites,
  toggleFavorite,
  selectedFoodId,
  setSelectedFoodId,
  userAddressList,
  setUserAddressList,
  selectedAddressId,
  setSelectedAddressId,
  activeOrderStep,
  setActiveOrderStep,
  orderPlacedTotal,
  setOrderPlacedTotal,
  userName,
  setUserName,
  userAvatar,
  setUserAvatar,
  orderHistory,
  setOrderHistory,
  firebaseUser,
  firebaseLoading,
  onGoogleSignIn,
  onSignOut
}) => {
  const t = TEXTS[language];

  // For Local states inside screens
  const [onboardIndex, setOnboardIndex] = useState(0);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtp, setLoginOtp] = useState(['', '', '', '']);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'tiffins' | 'meals' | 'fastfood' | 'drinks' | 'desserts'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHomeFilter, setSelectedHomeFilter] = useState<'popular' | 'healthy' | 'quick' | 'all'>('all');
  
  // Details local states
  const [detailsQty, setDetailsQty] = useState(1);
  
  // Cart states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<'CRAVE20' | 'CUTEBITES' | null>(null);
  
  // Address dynamic simulator
  const [newLabel, setNewLabel] = useState('Friend 🐨');
  const [newAddressText, setNewAddressText] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  // Meesho-style address form states
  const [meeshoName, setMeeshoName] = useState('');
  const [meeshoPhone, setMeeshoPhone] = useState('');
  const [meeshoHouse, setMeeshoHouse] = useState('');
  const [meeshoRoad, setMeeshoRoad] = useState('');
  const [meeshoPincode, setMeeshoPincode] = useState('');
  const [meeshoCity, setMeeshoCity] = useState('');
  const [meeshoState, setMeeshoState] = useState('');
  const [meeshoLandmark, setMeeshoLandmark] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Payment simulated animation loader
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentFinished, setPaymentFinished] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'phonepe' | 'gpay' | 'paytm'>('cod');

  // Profile interactive states
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [isSelectingAvatar, setIsSelectingAvatar] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Sound/Vibe triggers
  function triggerSparkleSound() {
    // Elegant micro audio synth trigger using Web Audio API for cozy immersive premium feel!
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15); // E6
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      // Audio sandbox constraint fallback - silent
    }
  }

  // Auto transition for splash screen
  useEffect(() => {
    if (currentScreen === AppScreen.SPLASH) {
      const timer = setTimeout(() => {
        onNavigate(AppScreen.ONBOARDING);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Reset states
  const resetLoginFlow = () => {
    setLoginPhone('');
    setLoginOtp(['', '', '', '']);
    setIsOtpSent(false);
  };

  // Helper getters
  const activeAddress = userAddressList.find(a => a.id === selectedAddressId) || userAddressList[0] || {
    id: 'no-address',
    label: 'No address added yet 📍',
    labelTelugu: 'చిరునామా లేదు 📍',
    addressLine: 'Please add your delivery address in the Address Hub.',
    addressLineTelugu: 'దయచేసి అడ్రస్ హబ్‌లో మీ చిరునామాను జోడించండి.',
    isDefault: false,
    city: 'Hyderabad'
  };

  const getFilteredItems = () => {
    return FOOD_ITEMS.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ? true : (
        item.name.toLowerCase().includes(q) || 
        (item.nameTelugu && item.nameTelugu.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.descriptionTelugu && item.descriptionTelugu.toLowerCase().includes(q))
      );
      const matchesTab = activeTab === 'all' || item.category === activeTab;
      
      let matchesFilter = true;
      if (selectedHomeFilter === 'popular') matchesFilter = item.popular;
      if (selectedHomeFilter === 'healthy') matchesFilter = item.healthy;
      if (selectedHomeFilter === 'quick') matchesFilter = item.quick;

      return matchesSearch && matchesTab && matchesFilter;
    });
  };

  const getCartTotal = () => {
    return cart.reduce((sum, cItem) => {
      const foodItem = FOOD_ITEMS.find(f => f.id === cItem.foodId);
      if (!foodItem) return sum;
      return sum + (foodItem.price * cItem.quantity);
    }, 0);
  };

  const currentFood = selectedFoodId ? FOOD_ITEMS.find(f => f.id === selectedFoodId) : FOOD_ITEMS[0];

  // Handles adding to cart with animation
  const handleAddToCart = (foodId: string, customQty = 1) => {
    triggerSparkleSound();
    setCart(prev => {
      const existing = prev.find(item => item.foodId === foodId);
      if (existing) {
        return prev.map(item => item.foodId === foodId ? { ...item, quantity: item.quantity + customQty } : item);
      } else {
        return [...prev, { foodId, quantity: customQty }];
      }
    });
  };

  const handleUpdateQty = (foodId: string, delta: number) => {
    triggerSparkleSound();
    setCart(prev => {
      return prev.map(item => {
        if (item.foodId === foodId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  // Switch to specific screen safely
  const navTo = (scr: AppScreen) => {
    triggerSparkleSound();
    onNavigate(scr);
  };

  // 1. SPLASH SCREEN
  if (currentScreen === AppScreen.SPLASH) {
    return (
      <div className={`h-full w-full flex flex-col justify-between items-center p-8 bg-gradient-to-b ${isDarkMode ? 'from-brand-charcoal to-[#1C1816]' : 'from-brand-cream to-brand-100'} transition-colors duration-500 overflow-hidden`}>
        {/* Top Floating Stars */}
        <div className="w-full flex justify-between px-4 pt-12 text-brand-primary opacity-60">
          <Sparkles className="animate-bounce" size={24} />
          <span className="text-sm font-bold tracking-widest font-mono text-brand-secondary">V2.4</span>
          <Sparkles className="animate-pulse" size={20} />
        </div>

        {/* Core Steaming Logo block */}
        <div className="flex flex-col items-center justify-center space-y-6 my-auto">
          <motion.div 
            initial={{ scale: 0.7, rotate: -15, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 10, stiffness: 80 }}
            className="relative w-44 h-44 flex items-center justify-center"
          >
            {/* Glowing cozy halo backdrop */}
            <div className="absolute inset-0 bg-brand-primary/10 rounded-full blur-2xl animate-pulse-glow" />
            
            {/* Steaming Food Plate Vector Mockup */}
            <div className={`relative w-36 h-36 rounded-full ${isDarkMode ? 'bg-brand-charcoal/80' : 'bg-white'} border-4 border-brand-primary shadow-xl flex items-center justify-center p-4`}>
              <div className="flex flex-col items-center">
                {/* Visual steam lines */}
                <div className="flex space-x-1.5 -mt-2 mb-1 justify-center">
                  <div className="w-1 h-4 bg-brand-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  <div className="w-1 h-4 bg-brand-yellow rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                </div>
                {/* Hot golden burger & sweet sparkling strawberry */}
                <span className="text-5xl select-none animate-float-slow">🥟</span>
                <span className="absolute transform translate-x-8 translate-y-6 text-xl">✨</span>
              </div>
            </div>
          </motion.div>

          <div className="text-center space-y-2">
            <h1 className="text-4xl font-extrabold font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary drop-shadow-sm">
              Cyra Bites
            </h1>
            <p className={`text-base font-semibold italic ${isDarkMode ? 'text-brand-yellow/80' : 'text-brand-secondary'} antialiased font-sans`}>
              “{t.tagline}”
            </p>
          </div>
        </div>

        {/* Dynamic loading progress bar */}
        <div className="w-full space-y-3 px-6 pb-8">
          <div className={`h-2.5 w-full ${isDarkMode ? 'bg-brand-charcoal/60' : 'bg-brand-cream-dark'} rounded-full overflow-hidden border border-brand-primary/20`}>
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3.2, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
            />
          </div>
          <p className="text-center text-xs text-brand-primary/80 font-mono animate-pulse tracking-wide uppercase">
            Loading Fresh Flavors...
          </p>
        </div>
      </div>
    );
  }

  // 2. ONBOARDING SCREEN
  if (currentScreen === AppScreen.ONBOARDING) {
    const pages = [
      {
        emoji: '🥞',
        title: t.onboard1_title,
        desc: t.onboard1_desc,
        color: 'from-brand-yellow/20 to-brand-primary/20',
        bubble: '🍳 Best Mornings!'
      },
      {
        emoji: '🛵',
        title: t.onboard2_title,
        desc: t.onboard2_desc,
        color: 'from-brand-primary/20 to-brand-secondary/20',
        bubble: '⚡ Super Sonic Speed!'
      },
      {
        emoji: '🍛',
        title: t.onboard3_title,
        desc: t.onboard3_desc,
        color: 'from-brand-secondary/20 to-brand-yellow/20',
        bubble: '🌙 Starry Cozy Feasts!'
      }
    ];

    const cur = pages[onboardIndex];

    return (
      <div className={`h-full w-full flex flex-col justify-between p-7 bg-gradient-to-b ${isDarkMode ? 'from-brand-charcoal to-[#1C1816]' : 'from-brand-cream to-white'} transition-all duration-300`}>
        {/* Skip button header */}
        <div className="flex justify-between items-center pt-8">
          <span className="text-xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
            Cyra Bites ✨
          </span>
          <button 
            onClick={() => navTo(AppScreen.LOGIN)}
            className={`text-xs px-3.5 py-1.5 rounded-full font-bold tracking-wide transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-brand-yellow' : 'bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary'}`}
          >
            {language === 'en' ? 'Skip 🍕' : 'స్కిప్ 🍕'}
          </button>
        </div>

        {/* Floating cozy vector visualizer */}
        <div className="my-auto flex flex-col items-center justify-center text-center space-y-6">
          <motion.div 
            key={onboardIndex}
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", damping: 15 }}
            className={`relative w-56 h-56 rounded-full bg-gradient-to-tr ${cur.color} flex items-center justify-center p-2`}
          >
            {/* Floating indicator */}
            <div className="absolute -top-3 transform bg-white dark:bg-brand-charcoal px-3 py-1 rounded-full shadow-md border border-brand-primary/20 text-[10px] font-extrabold text-brand-primary uppercase tracking-wide">
              {cur.bubble}
            </div>

            <div className="relative text-7xl select-none animate-float-slow">
              {cur.emoji}
            </div>
            
            {/* Sparkles particle circle representation */}
            <span className="absolute top-8 left-8 text-xl animate-pulse">✨</span>
            <span className="absolute bottom-12 right-8 text-xl animate-pulse">✨</span>
          </motion.div>

          <div className="px-3 space-y-3">
            <h2 className={`text-2xl font-extrabold font-display leading-tight ${isDarkMode ? 'text-white' : 'text-brand-charcoal'}`}>
              {cur.title}
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed font-sans`}>
              {cur.desc}
            </p>
          </div>
        </div>

        {/* Foot Control Navigation Drawer */}
        <div className="space-y-6 pb-6">
          {/* Bullets indicator */}
          <div className="flex justify-center space-x-2">
            {pages.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => { triggerSparkleSound(); setOnboardIndex(idx); }}
                className={`h-2.5 rounded-full transition-all ${idx === onboardIndex ? 'w-8 bg-brand-primary' : 'w-2.5 bg-brand-primary/30'}`}
              />
            ))}
          </div>

          {/* Action button */}
          <AnimatePresence mode="wait">
            {onboardIndex === 2 ? (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => navTo(AppScreen.LOGIN)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-extrabold shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/45 transition-all text-sm tracking-wide flex items-center justify-center space-x-2 animate-pulse-glow"
              >
                <span>{t.startCravings}</span>
                <ArrowRight size={16} />
              </motion.button>
            ) : (
              <button
                onClick={() => { triggerSparkleSound(); setOnboardIndex(prev => prev + 1); }}
                className={`w-full py-4 rounded-2xl ${isDarkMode ? 'bg-brand-charcoal border border-brand-primary/30 text-white' : 'bg-brand-primary/10 hover:bg-brand-primary/15 text-brand-primary'} font-bold transition-all text-sm tracking-wide flex items-center justify-center space-x-2`}
              >
                <span>{language === 'en' ? 'Continue' : 'మరింత ముందుకు'}</span>
                <ArrowRight size={16} />
              </button>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // 3. LOGIN / SIGNUP SCREEN
  if (currentScreen === AppScreen.LOGIN) {
    const handleSendOtp = (e: React.FormEvent) => {
      e.preventDefault();
      if (loginPhone.length >= 10) {
        triggerSparkleSound();
        setIsOtpSent(true);
      }
    };

    const handleOtpChange = (val: string, index: number) => {
      triggerSparkleSound();
      const updated = [...loginOtp];
      updated[index] = val.substring(0, 1);
      setLoginOtp(updated);
      
      // Auto-focus next input
      if (val && index < 3) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        nextInput?.focus();
      }
    };

    const submitOtpVerify = () => {
      triggerSparkleSound();
      navTo(AppScreen.HOME);
    };

    return (
      <div className={`h-full w-full flex flex-col justify-between p-7 ${isDarkMode ? 'bg-brand-charcoal text-white' : 'bg-brand-cream text-brand-charcoal'} transition-all`}>
        {/* Back button */}
        <div className="flex items-center pt-8 justify-between">
          <button 
            onClick={() => { resetLoginFlow(); navTo(AppScreen.ONBOARDING); }}
            className={`p-2.5 rounded-full ${isDarkMode ? 'bg-brand-cream/5 text-white' : 'bg-white shadow-sm text-brand-charcoal'}`}
          >
            <ArrowLeft size={16} />
          </button>
          <span className="font-display font-bold text-sm text-brand-primary">SECURE LOGIN 🔐</span>
        </div>

        {/* Input center logic */}
        <div className="my-auto space-y-7">
          <div className="text-center space-y-2">
            <div className="text-5xl select-none animate-float-slow">🥟</div>
            <h2 className="text-2xl font-extrabold font-display">{t.loginTitle}</h2>
            <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{t.loginSubtitle}</p>
          </div>

          <AnimatePresence mode="wait">
            {!isOtpSent ? (
              <motion.form 
                key="phone-form"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                onSubmit={handleSendOtp}
                className="space-y-4"
              >
                {/* Custom phone input field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-primary uppercase tracking-wider">{t.phoneNumber}</label>
                  <div className={`flex items-center rounded-2xl border ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-white border-brand-primary/20'} overflow-hidden focus-within:border-brand-primary transition-all p-1`}>
                    <div className="flex items-center px-3 space-x-1.5 border-r border-gray-300/30 text-sm font-bold text-brand-secondary select-none">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input 
                      type="tel"
                      required
                      placeholder="98765 43210"
                      maxLength={10}
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-transparent px-4 py-3.5 text-sm font-semibold outline-none focus:ring-0 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loginPhone.length < 10}
                    className={`w-full py-4 rounded-2xl font-extrabold transition-all text-sm tracking-wide shadow-md ${
                      loginPhone.length >= 10 
                        ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-95' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {language === 'en' ? 'Get OTP Code 💌' : 'ఓటిపి పొందండి 💌'}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="otp-form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-5 text-center"
              >
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-brand-primary">{t.otpTitle}</h3>
                  <p className="text-xs text-gray-400">
                    {t.otpSubtitle}: <span className="font-bold text-brand-secondary">+91 {loginPhone}</span>
                  </p>
                </div>

                {/* Simulated 4 digit boxes */}
                <div className="flex justify-center space-x-3.5 my-4">
                  {loginOtp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && idx > 0) {
                          const prev = document.getElementById(`otp-input-${idx - 1}`);
                          prev?.focus();
                        }
                      }}
                      className={`w-12 h-14 text-center text-xl font-bold rounded-xl border ${isDarkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-white border-brand-primary/30 text-brand-charcoal'} focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all`}
                    />
                  ))}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={submitOtpVerify}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-extrabold shadow-lg shadow-brand-primary/20 hover:opacity-95 transition-all text-sm tracking-wide"
                  >
                    {t.confirmCode}
                  </button>
                  
                  <button 
                    onClick={() => { triggerSparkleSound(); setIsOtpSent(false); }}
                    className="text-xs font-semibold text-brand-secondary hover:underline underline-offset-4"
                  >
                    {language === 'en' ? 'Change Phone Number ✏️' : 'నెంబర్ మార్చుకోండి ✏️'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social login line */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300/30"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or continue with</span>
            <div className="flex-grow border-t border-gray-300/30"></div>
          </div>

          <button 
            disabled={firebaseLoading}
            onClick={async () => { 
              triggerSparkleSound(); 
              if (onGoogleSignIn) {
                const loggedIn = await onGoogleSignIn();
                if (loggedIn) {
                  navTo(AppScreen.HOME);
                }
              } else {
                navTo(AppScreen.HOME);
              }
            }}
            className={`w-full py-3.5 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/15 text-white' : 'bg-white border-gray-200 text-gray-700'} hover:bg-gray-100/10 transition-all text-xs font-extrabold flex items-center justify-center space-x-2 active:scale-98 disabled:opacity-50`}
          >
            <Globe className={`text-blue-500 ${firebaseLoading ? 'animate-spin' : ''}`} size={16} />
            <span>{firebaseLoading ? 'Signing in...' : t.googleLogin}</span>
          </button>
        </div>

        {/* Small security footer */}
        <p className="text-center text-[10px] text-gray-400/80 leading-relaxed max-w-[220px] mx-auto pb-4">
          By logging in, you agree to cook clean transactions and secure sweet smiles with Cyra Bites policy.
        </p>
      </div>
    );
  }

  // 4. HOME PAGE
  if (currentScreen === AppScreen.HOME) {
    const activeItems = getFilteredItems();

    return (
      <div className={`h-full w-full flex flex-col justify-between ${isDarkMode ? 'bg-brand-charcoal text-white' : 'bg-brand-cream text-brand-charcoal'} transition-all`}>
        {/* Dynamic header */}
        <div className="px-6 pt-10 pb-3 space-y-4 shadow-sm border-b border-brand-primary/5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-tr from-brand-primary to-brand-secondary text-white rounded-xl shadow-md">
                <MapPin size={18} className="animate-bounce" />
              </div>
              <div 
                onClick={() => navTo(AppScreen.ADDRESS_SETUP)}
                className="text-left cursor-pointer"
              >
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-brand-secondary">
                    {language === 'en' ? 'Deliver to 📍' : 'డెలివరీ ప్రదేశం 📍'}
                  </span>
                  <ChevronRight size={12} className="text-brand-secondary" />
                </div>
                <h4 className="text-sm font-bold truncate max-w-[150px]">
                  {language === 'en' ? activeAddress.label : activeAddress.labelTelugu}
                </h4>
              </div>
            </div>

            {/* Notification & profile bell icon drawer */}
            <div className="flex items-center space-x-1.5 pt-0.5">
              {/* Language Selection */}
              <button
                onClick={() => { triggerSparkleSound(); setLanguage(language === 'en' ? 'te' : 'en'); }}
                className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-black tracking-wide transition-all ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/10 text-brand-secondary hover:bg-white/10' 
                    : 'bg-white border-brand-primary/25 text-brand-secondary hover:bg-neutral-50'
                }`}
                title={language === 'en' ? 'Change to Telugu' : 'Change to English'}
              >
                🌐 {language === 'en' ? 'తే' : 'En'}
              </button>

              {/* Light vs Dark Theme Selection */}
              <button
                onClick={() => { triggerSparkleSound(); setIsDarkMode(!isDarkMode); }}
                className={`p-2 rounded-xl border transition-all ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10' 
                    : 'bg-white border-brand-primary/20 text-gray-500 hover:text-gray-800 hover:bg-neutral-50'
                }`}
                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>

              <button 
                onClick={() => navTo(AppScreen.PROFILE)}
                className={`p-2 rounded-xl border transition-all ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                    : 'bg-white border-brand-primary/20 text-brand-charcoal hover:bg-neutral-50'
                } relative`}
              >
                <Award size={15} className="text-brand-yellow animate-pulse" />
                <span className="absolute -top-1 -right-1 bg-brand-secondary text-white text-[7px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center animate-bounce">
                  ✨
                </span>
              </button>
            </div>
          </div>

          {/* Sparkly greeting */}
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <h2 className="text-lg font-extrabold font-display">
                {language === 'en' ? 'Hey, Hungry Human! 👋' : 'నమస్తే, ఆహార ప్రియులారా! 👋'}
              </h2>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              {language === 'en' ? 'What delicious comfort do you crave today?' : 'ఈరోజు మీకు కావాల్సిన స్పెషల్ రుచి ఏమిటి?'}
            </p>
          </div>

          {/* Search bar inside Home screen */}
          <div className="flex space-x-2">
            <div className={`flex-1 flex items-center rounded-xl border ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-white border-brand-primary/20'} px-3 py-2 text-xs`}>
              <Compass className="text-brand-primary mr-2" size={14} />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent outline-none font-medium placeholder:text-gray-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 font-extrabold hover:text-brand-secondary px-1">✕</button>
              )}
            </div>
          </div>
        </div>

        {/* Categories navigation slider */}
        <div className="px-6 py-3 overflow-x-auto no-scrollbar flex space-x-3 select-none">
          {([
            { key: 'all', emoji: '🍽️', en: 'All Vibes', te: 'అన్నీ' },
            { key: 'tiffins', emoji: '🍘', en: 'Tiffins', te: 'టిఫిన్స్' },
            { key: 'meals', emoji: '🍛', en: 'Meals Thali', te: 'భోజనం' },
            { key: 'fastfood', emoji: '🍔', en: 'Fast Food', te: 'ఫాస్ట్ ఫుడ్' },
            { key: 'drinks', emoji: '🥤', en: 'Soft Drinks', te: 'డ్రింక్స్' },
            { key: 'desserts', emoji: '🍰', en: 'Desserts', te: 'డెజర్ట్స్' }
          ] as const).map(cat => {
            const isSel = activeTab === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => { triggerSparkleSound(); setActiveTab(cat.key); }}
                className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                  isSel 
                    ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white' 
                    : isDarkMode ? 'bg-black/25 text-gray-300 hover:bg-black/40' : 'bg-white text-gray-600 hover:bg-brand-cream-dark'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{language === 'en' ? cat.en : cat.te}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Center Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-2 pb-14 space-y-5">
          {/* Preset highlight pill toggles */}
          <div className="flex space-x-1.5">
            {[
              { key: 'all', label: 'All 🌟' },
              { key: 'popular', label: 'Popular 🔥' },
              { key: 'healthy', label: 'Healthy 🥦' },
              { key: 'quick', label: 'Quick ⚡' }
            ].map(fPill => (
              <button
                key={fPill.key}
                onClick={() => { triggerSparkleSound(); setSelectedHomeFilter(fPill.key as any); }}
                className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all ${
                  selectedHomeFilter === fPill.key 
                    ? 'bg-brand-secondary text-white' 
                    : isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {fPill.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-brand-primary tracking-wide uppercase">
              {selectedHomeFilter === 'popular' ? t.popular : selectedHomeFilter === 'healthy' ? t.healthy : selectedHomeFilter === 'quick' ? t.quick : (language === 'en' ? 'Fresh Menus 🍕' : 'నేటి స్పెషల్స్ 🍕')}
            </h3>

            {activeItems.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <span className="text-4xl animate-bounce inline-block">🍲</span>
                <p className="text-xs text-gray-400 font-bold">No cozy bites found matching requirements.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 select-none">
                {activeItems.map(item => {
                  const healthColor = item.healthIndicator === 'green' ? 'bg-brand-green' : item.healthIndicator === 'yellow' ? 'bg-brand-yellow' : 'bg-brand-secondary';
                  const inCart = cart.find(c => c.foodId === item.id);
                  const isFav = favorites.includes(item.id);

                  return (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      key={item.id}
                      className={`relative rounded-3xl overflow-hidden shadow-xs border ${
                        isDarkMode ? 'bg-brand-charcoal/40 border-white/10' : 'bg-white border-brand-primary/10'
                      }`}
                    >
                      {/* Floating details */}
                      <button 
                        onClick={() => toggleFavorite(item.id)}
                        className="absolute top-3.5 right-3.5 p-2 rounded-full glass-effect z-10 text-brand-secondary hover:scale-110 active:scale-95 transition-all shadow-xs"
                      >
                        <Heart size={14} fill={isFav ? '#FF8596' : 'transparent'} className={isFav ? 'text-brand-secondary animate-pulse' : 'text-gray-500'} />
                      </button>

                      {/* Image header */}
                      <div 
                        onClick={() => { setSelectedFoodId(item.id); navTo(AppScreen.DETAILS); }}
                        className="relative h-44 w-full cursor-pointer overflow-hidden group"
                      >
                        <img 
                          src={item.image} 
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                        {/* Health Dot Indicator */}
                        <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-bold">
                          <span className={`w-2.5 h-2.5 rounded-full ${healthColor} inline-block border border-white`} />
                          <span>
                            {item.healthIndicator === 'green' ? 'Healthy 🥦' : item.healthIndicator === 'yellow' ? 'Balanced ⚖️' : 'Heavy Spoon 🍛'}
                          </span>
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="p-4 space-y-3">
                        <div 
                          onClick={() => { setSelectedFoodId(item.id); navTo(AppScreen.DETAILS); }}
                          className="flex justify-between items-start cursor-pointer"
                        >
                          <div className="space-y-0.5">
                            <h4 className="text-base font-extrabold font-display leading-tight truncate max-w-[200px]">
                              {language === 'en' ? item.name : item.nameTelugu}
                            </h4>
                            <p className="text-xs text-gray-500/80 font-medium truncate max-w-[190px]">
                              {language === 'en' ? item.description : item.descriptionTelugu}
                            </p>
                          </div>
                          <div className="text-right whitespace-nowrap">
                            <div className="text-base font-black text-brand-secondary">₹{item.price}</div>
                            <div className="text-[9px] font-mono font-bold text-gray-400">{item.calories} kCal</div>
                          </div>
                        </div>

                        {/* Metric Row */}
                        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold pt-1.5 border-t border-gray-300/20">
                          <div className="flex items-center space-x-1">
                            <Star className="text-brand-yellow fill-brand-yellow" size={12} />
                            <span className={isDarkMode ? 'text-white' : 'text-brand-charcoal'}>{item.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={12} className="text-brand-primary" />
                            <span>{item.deliveryTime} mins</span>
                          </div>
                          
                          {/* Easy interactive button */}
                          {inCart ? (
                            <div className="flex items-center space-x-2 bg-brand-primary/10 rounded-full px-2.5 py-1">
                              <button onClick={() => handleUpdateQty(item.id, -1)} className="text-brand-primary hover:scale-110 font-bold text-sm select-none">
                                <Minus size={11} />
                              </button>
                              <span className="font-bold text-brand-primary text-xs font-mono">{inCart.quantity}</span>
                              <button onClick={() => handleAddToCart(item.id, 1)} className="text-brand-primary hover:scale-110 font-bold select-none">
                                <Plus size={11} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(item.id)}
                              className="bg-brand-primary hover:bg-brand-primary/95 text-white rounded-full px-3.5 py-1 text-[10px] font-bold shadow-xs hover:shadow-md transition-all flex items-center space-x-1 active:scale-95"
                            >
                              <Plus size={10} strokeWidth={3} />
                              <span>{language === 'en' ? 'Add' : 'చేర్చు'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom floating cart summary drawer if something added */}
        {cart.length > 0 && (
          <div className="absolute bottom-18 left-4 right-4 z-20">
            <motion.div 
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-xl flex justify-between items-center"
            >
              <div className="flex items-center space-x-2.5">
                <ShoppingBag size={18} className="animate-bounce" />
                <div>
                  <h5 className="text-xs font-black">{cart.length} {cart.length === 1 ? 'cozy bite' : 'cozy bites'} loaded</h5>
                  <p className="text-[10px] opacity-90 font-bold">Total: ₹{getCartTotal()}</p>
                </div>
              </div>
              <button 
                onClick={() => navTo(AppScreen.CART)}
                className="bg-white text-brand-secondary font-black text-xs px-4 py-2 rounded-xl flex items-center space-x-1 shadow-sm active:scale-95 transition-all"
              >
                <span>{language === 'en' ? 'Order 🍔' : 'ఆర్డర్ 🍔'}</span>
                <ChevronRight size={12} />
              </button>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // 5. FOOD DETAILS PAGE
  if (currentScreen === AppScreen.DETAILS) {
    if (!currentFood) return null;
    const isFav = favorites.includes(currentFood.id);
    const inCart = cart.find(c => c.foodId === currentFood.id);

    return (
      <div className={`h-full w-full flex flex-col justify-between ${isDarkMode ? 'bg-brand-charcoal text-white' : 'bg-brand-cream text-brand-charcoal'} transition-all`}>
        {/* Curved image header */}
        <div className="relative h-72 w-full">
          <img 
            src={currentFood.image} 
            alt={currentFood.name}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
          {/* Fading dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/10" />

          {/* Top buttons overlay */}
          <div className="absolute top-10 left-4 right-4 flex justify-between items-center">
            <button 
              onClick={() => navTo(AppScreen.HOME)}
              className="p-2.5 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all shadow-xs"
            >
              <ArrowLeft size={16} />
            </button>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-display bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full select-none">
              {language === 'en' ? currentFood.category : currentFood.category.toUpperCase()} 🍽️
            </h3>
            <button 
              onClick={() => toggleFavorite(currentFood.id)}
              className="p-2.5 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all shadow-xs"
            >
              <Heart size={16} fill={isFav ? '#FF8596' : 'transparent'} className={isFav ? 'text-brand-secondary' : 'text-white'} />
            </button>
          </div>

          {/* Rating tag overlay */}
          <div className="absolute bottom-4 right-4 bg-brand-yellow/90 backdrop-blur-xs text-brand-charcoal px-3 py-1 rounded-full text-xs font-black flex items-center space-x-1 shadow-lg">
            <Star size={12} fill="#2D2724" />
            <span>{currentFood.rating}</span>
          </div>
        </div>

        {/* Scrollable specs info wrapper */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-5 space-y-5">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-black font-display tracking-tight leading-tight">
                {language === 'en' ? currentFood.name : currentFood.nameTelugu}
              </h2>
              <div className="flex items-center space-x-2">
                <span className={`h-2.5 w-2.5 rounded-full ${currentFood.healthIndicator === 'green' ? 'bg-brand-green' : currentFood.healthIndicator === 'yellow' ? 'bg-brand-yellow' : 'bg-brand-secondary'}`} />
                <span className="text-xs font-bold text-gray-400">
                  {currentFood.healthIndicator === 'green' ? 'Healthy recipe recommended' : currentFood.healthIndicator === 'yellow' ? 'Deliciously balanced selection' : 'Heavy royal comfort choice'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-brand-secondary">₹{currentFood.price}</div>
              <span className="text-[10px] font-mono text-gray-400 font-bold">{currentFood.deliveryTime} mins cook ETA</span>
            </div>
          </div>

          {/* High-fidelity nutritional value cards */}
          <div className="grid grid-cols-4 gap-2 text-center select-none">
            {[
              { val: `${currentFood.calories} kCal`, tag: t.calories, color: 'bg-brand-primary/10 text-brand-primary' },
              { val: currentFood.protein, tag: t.protein, color: 'bg-brand-green/10 text-brand-green' },
              { val: currentFood.carbs, tag: t.carbs, color: 'bg-brand-yellow/10 text-brand-yellow' },
              { val: currentFood.fat, tag: t.fat, color: 'bg-brand-secondary/10 text-brand-secondary' }
            ].map((nut, idx) => (
              <div key={idx} className={`${nut.color} p-3 rounded-2xl space-y-1 shadow-xs border border-white/5`}>
                <div className="text-xs font-bold font-mono tracking-tight">{nut.val}</div>
                <div className="text-[9px] font-bold opacity-80 uppercase tracking-widest">{nut.tag}</div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black text-brand-primary uppercase tracking-widest">Description ✨</h4>
            <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed font-sans`}>
              {language === 'en' ? currentFood.description : currentFood.descriptionTelugu}
            </p>
          </div>

          {/* Warm Ingredients */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-brand-primary uppercase tracking-widest">{t.ingredientsTitle} 🍲</h4>
            <div className="flex flex-wrap gap-2 select-none">
              {((language === 'en' ? currentFood.ingredients : currentFood.ingredientsTelugu) as string[]).map((ing, i) => (
                <div key={i} className={`flex items-center space-x-1 text-xs px-3 py-1.5 rounded-xl border ${isDarkMode ? 'bg-black/15 border-white/10 text-gray-300' : 'bg-white border-brand-primary/10 text-gray-700'}`}>
                  <span className="text-[9px] text-brand-secondary">●</span>
                  <span className="font-semibold">{ing}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* sticky buy footer */}
        <div className={`p-5 flex items-center justify-between border-t ${isDarkMode ? 'bg-brand-charcoal/80 border-white/10' : 'bg-white border-brand-primary/5'}`}>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Kitchen qty</span>
            <div className={`flex items-center space-x-3.5 border ${isDarkMode ? 'border-white/10' : 'border-brand-primary/10'} rounded-xl p-1.5`}>
              <button 
                onClick={() => { triggerSparkleSound(); setDetailsQty(prev => prev > 1 ? prev - 1 : 1); }}
                className="text-brand-secondary font-black select-none hover:scale-110 active:scale-95"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm font-black font-mono w-4 text-center">{detailsQty}</span>
              <button 
                onClick={() => { triggerSparkleSound(); setDetailsQty(prev => prev + 1); }}
                className="text-brand-secondary font-black select-none hover:scale-110 active:scale-95"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Primary click trigger */}
          <button
            onClick={() => {
              handleAddToCart(currentFood.id, detailsQty);
              setDetailsQty(1);
              navTo(AppScreen.HOME);
            }}
            className="flex-1 max-w-[200px] py-3.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-2xl font-black text-xs shadow-md shadow-brand-primary/10 hover:shadow-brand-primary/30 active:scale-95 transition-all text-center flex justify-center items-center space-x-2"
          >
            <span>{t.addToCart}</span>
            <span>(₹{currentFood.price * detailsQty})</span>
          </button>
        </div>
      </div>
    );
  }

  // 6. CART PAGE
  if (currentScreen === AppScreen.CART) {
    const totalFoodPrice = getCartTotal();
    const deliveryFee = totalFoodPrice > 300 ? 0 : 30; // Free delivery over 300
    const cookingTax = 15;
    
    // Coupon Logic
    let discount = 0;
    if (appliedCoupon === 'CRAVE20') {
      discount = Math.round(totalFoodPrice * 0.20);
    } else if (appliedCoupon === 'CUTEBITES') {
      discount = Math.min(totalFoodPrice, 50);
    }

    const finalTotal = Math.max(0, (totalFoodPrice + deliveryFee + cookingTax) - discount);

    // Calculate total order nutrients
    const totalNutrition = cart.reduce((acc, cItem) => {
      const food = FOOD_ITEMS.find(f => f.id === cItem.foodId);
      if (food) {
        const pNum = parseInt(food.protein) || 0;
        const cNum = parseInt(food.carbs) || 0;
        const fNum = parseInt(food.fat) || 0;
        acc.calories += food.calories * cItem.quantity;
        acc.protein += pNum * cItem.quantity;
        acc.carbs += cNum * cItem.quantity;
        acc.fat += fNum * cItem.quantity;
      }
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const handleApplyCoupon = (e: React.FormEvent) => {
      e.preventDefault();
      triggerSparkleSound();
      const code = couponCode.toUpperCase().trim();
      if (code === 'CRAVE20') {
        setAppliedCoupon('CRAVE20');
        setCouponCode('');
      } else if (code === 'CUTEBITES') {
        setAppliedCoupon('CUTEBITES');
        setCouponCode('');
      } else {
        alert(language === 'en' ? 'Invalid Coupon! Try "CRAVE20" (20% off) or "CUTEBITES" (₹50 off)' : 'చెల్లని కూపన్! "CRAVE20" లేదా "CUTEBITES" ప్రయత్నించండి.');
      }
    };

    const handleCheckout = () => {
      if (activeAddress.id === 'no-address' || userAddressList.length === 0) {
        navTo(AppScreen.ADDRESS_SETUP);
        return;
      }
      if (cart.length > 0) {
        setOrderPlacedTotal(finalTotal);
        navTo(AppScreen.PAYMENT);
      }
    };

    return (
      <div className={`h-full w-full flex flex-col justify-between ${isDarkMode ? 'bg-brand-charcoal text-white' : 'bg-brand-cream text-brand-charcoal'} transition-all`}>
        {/* Header */}
        <div className="flex items-center pt-10 pb-3 px-6 h-18 justify-between border-b border-brand-primary/5">
          <button 
            onClick={() => navTo(AppScreen.HOME)}
            className={`p-2.5 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-white shadow-xs'}`}
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="font-extrabold font-display text-sm">{t.cartTitle}</h2>
          <button 
            onClick={() => { triggerSparkleSound(); setCart([]); }}
            className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-full font-bold flex items-center space-x-1"
            disabled={cart.length === 0}
          >
            <Trash2 size={10} />
            <span>{language === 'en' ? 'Clear' : 'ఖాళీ'}</span>
          </button>
        </div>

        {/* Scrollable list of items */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <span className="text-5xl animate-bounce leading-none inline-block">🧺</span>
              <p className="text-xs text-gray-500 max-w-[190px] mx-auto leading-relaxed">
                {t.emptyCart}
              </p>
              <button 
                onClick={() => navTo(AppScreen.HOME)}
                className="bg-brand-primary text-white text-xs font-extrabold px-5 py-2.5 rounded-xl block mx-auto hover:bg-brand-primary/95 shadow-sm"
              >
                {language === 'en' ? 'Go to Menu 🍕' : 'మెనూకు వెళ్ళండి 🍕'}
              </button>
            </div>
          ) : (
            <div className="space-y-4 select-none">
              {/* Order Cumulative Nutrition widget */}
              <div className={`p-4 rounded-3xl border space-y-2.5 ${
                isDarkMode ? 'bg-gradient-to-br from-emerald-950/20 to-teal-950/20 border-emerald-500/25' : 'bg-gradient-to-br from-emerald-50/60 to-teal-50/60 border-emerald-500/15'
              }`}>
                <div className="flex items-center justify-between text-xs font-black text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center space-x-1">
                    <span>🥗</span>
                    <span className="font-display tracking-tight text-[11px]">{language === 'en' ? 'Active Order Nutrition Summary' : 'పోషక విలువల సారాంశం'}</span>
                  </span>
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase">
                    {language === 'en' ? 'Balanced' : 'సమతుల్య'}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="p-2 bg-white/70 dark:bg-black/20 rounded-xl border border-emerald-500/5">
                    <span className="block text-gray-400 text-[8px] font-bold">{language === 'en' ? 'Calories' : 'శక్తి'}</span>
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 font-mono">{totalNutrition.calories} kCal</span>
                  </div>
                  <div className="p-2 bg-white/70 dark:bg-black/20 rounded-xl border border-emerald-500/5">
                    <span className="block text-gray-400 text-[8px] font-bold">{language === 'en' ? 'Protein' : 'ప్రోటీన్'}</span>
                    <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 font-mono">{totalNutrition.protein}g</span>
                  </div>
                  <div className="p-2 bg-white/70 dark:bg-black/20 rounded-xl border border-emerald-500/5">
                    <span className="block text-gray-400 text-[8px] font-bold">{language === 'en' ? 'Carbs' : 'కార్బ్స్'}</span>
                    <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 font-mono">{totalNutrition.carbs}g</span>
                  </div>
                  <div className="p-2 bg-white/70 dark:bg-black/20 rounded-xl border border-emerald-500/5">
                    <span className="block text-gray-400 text-[8px] font-bold">{language === 'en' ? 'Fats' : 'కొవ్వులు'}</span>
                    <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 font-mono">{totalNutrition.fat}g</span>
                  </div>
                </div>
              </div>

              {cart.map(cItem => {
                const food = FOOD_ITEMS.find(f => f.id === cItem.foodId);
                if (!food) return null;

                const itemCalories = food.calories * cItem.quantity;
                const pNum = (parseInt(food.protein) || 0) * cItem.quantity;
                const cNum = (parseInt(food.carbs) || 0) * cItem.quantity;
                const fNum = (parseInt(food.fat) || 0) * cItem.quantity;

                return (
                  <div 
                    key={cItem.foodId}
                    className={`p-3.5 rounded-2xl flex items-center space-x-3.5 border ${
                      isDarkMode ? 'bg-black/15 border-white/10' : 'bg-white border-brand-primary/10'
                    }`}
                  >
                    <img 
                      src={food.image} 
                      alt={food.name}
                      referrerPolicy="no-referrer"
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-xs font-black truncate">
                        {language === 'en' ? food.name : food.nameTelugu}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-brand-secondary font-black">₹{food.price}</span>
                        <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-md font-bold">
                          {itemCalories} kCal
                        </span>
                      </div>
                      <div className="flex space-x-2 text-[8px] text-gray-400 font-bold">
                        <span>P: {pNum}g</span>
                        <span>C: {cNum}g</span>
                        <span>F: {fNum}g</span>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className={`flex items-center space-x-2.5 border ${isDarkMode ? 'border-white/10' : 'border-neutral-100'} rounded-xl p-1`}>
                      <button 
                        onClick={() => handleUpdateQty(food.id, -1)}
                        className="text-gray-400 hover:scale-110 font-bold px-1"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-bold font-mono">{cItem.quantity}</span>
                      <button 
                        onClick={() => handleAddToCart(food.id, 1)}
                        className="text-brand-primary hover:scale-110 font-bold px-1"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Coupon drawer */}
              <form 
                onSubmit={handleApplyCoupon}
                className={`p-4 rounded-3xl border space-y-2.5 ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-white border-brand-primary/10'}`}
              >
                <div className="flex justify-between items-center text-xs font-extrabold text-brand-primary">
                  <span className="flex items-center space-x-1">
                    <Gift size={14} />
                    <span>{t.couponSection}</span>
                  </span>
                  <span className="font-mono text-[10px] text-brand-secondary tracking-widest animate-pulse">CRAVE20</span>
                </div>

                <div className="flex space-x-2">
                  <input 
                    type="text"
                    placeholder='Type "CRAVE20" or "CUTEBITES"'
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className={`flex-1 px-3 py-2 text-xs rounded-xl border font-bold uppercase outline-none focus:border-brand-primary ${
                      isDarkMode ? 'bg-black/15 border-white/10' : 'bg-neutral-50 border-gray-200'
                    }`}
                  />
                  <button 
                    type="submit"
                    className="bg-brand-primary text-white text-xs font-black px-4 py-2 rounded-xl active:scale-95 shadow-sm transition-all text-center inline-block"
                  >
                    {t.applyBtn}
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-[10px] bg-brand-green/10 text-brand-green px-2.5 py-1.5 rounded-lg font-bold">
                    <span>Activated: {appliedCoupon === 'CRAVE20' ? '20% Off Crave Love!' : 'Flat ₹50 Delight!'} ✅</span>
                    <button 
                      onClick={() => { triggerSparkleSound(); setAppliedCoupon(null); }}
                      className="text-brand-secondary font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </form>

               {/* Saved Address brief hook */}
              <div 
                onClick={() => navTo(AppScreen.ADDRESS_SETUP)}
                className={`p-3.5 rounded-3xl border flex justify-between items-center cursor-pointer transition-all ${
                  activeAddress.id === 'no-address'
                    ? 'border-dashed border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 animate-pulse'
                    : isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-brand-primary/10'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="text-brand-secondary animate-bounce" size={14} />
                  <div>
                    <h5 className="text-xs font-black">
                      {language === 'en' ? 'Address: ' : 'చిరునామా: '} {language === 'en' ? activeAddress.label : activeAddress.labelTelugu}
                    </h5>
                    <p className="text-[10px] text-gray-400 truncate max-w-[140px]">
                      {language === 'en' ? activeAddress.addressLine : activeAddress.addressLineTelugu}
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-400" />
              </div>

              {/* Price Breakdown Receipts */}
              <div className="space-y-2 pt-2 text-xs font-bold text-gray-500/90">
                <div className="flex justify-between items-center text-sm font-black text-brand-primary">
                  <span>{t.priceBreakdown}</span>
                  <span>🧺 Reciept</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.itemTotal}</span>
                  <span>₹{totalFoodPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.deliveryFee}</span>
                  <span>{deliveryFee === 0 ? 'FREE ✨' : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.taxes}</span>
                  <span>₹{cookingTax}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-brand-green">
                    <span>{t.couponDiscount}</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-brand-secondary pt-2 border-t border-dashed border-gray-300">
                  <span>{t.grandTotal}</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>
            </div>
          )}
        </div>

         {/* Footer payment launcher */}
        {cart.length > 0 && (
          <div className={`p-5 border-t ${isDarkMode ? 'bg-brand-charcoal/80 border-white/10' : 'bg-white border-brand-primary/5'}`}>
            {activeAddress.id === 'no-address' ? (
              <button
                onClick={() => navTo(AppScreen.ADDRESS_SETUP)}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-brand-primary text-white rounded-2xl font-black text-xs shadow-md shadow-brand-primary/10 hover:shadow-brand-primary/30 transition-all text-center flex justify-center items-center space-x-2 active:scale-95 animate-pulse-glow"
              >
                <span>{language === 'en' ? 'Add Custom Address Option first ➕' : 'ముందుగా చిరునామాను జోడించండి ➕'}</span>
              </button>
            ) : (
              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-2xl font-black text-xs shadow-md shadow-brand-primary/10 hover:shadow-brand-primary/30 transition-all text-center flex justify-center items-center space-x-2 active:scale-95 animate-pulse-glow"
              >
                <span>{t.proceedCheckout}</span>
                <span>(₹{finalTotal})</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // 7. ADDRESS SETUP PAGE
  if (currentScreen === AppScreen.ADDRESS_SETUP) {
    const handleAddAddress = (e: React.FormEvent) => {
      e.preventDefault();
      triggerSparkleSound();
      
      setPincodeError('');
      setPhoneError('');

      const trimmedName = meeshoName.trim();
      const trimmedPhone = meeshoPhone.trim().replace(/\D/g, '');
      const trimmedHouse = meeshoHouse.trim();
      const trimmedRoad = meeshoRoad.trim();
      const trimmedPincode = meeshoPincode.trim().replace(/\D/g, '');
      const trimmedCity = meeshoCity.trim() || 'Hyderabad';
      const trimmedState = meeshoState.trim() || 'Telangana';
      const trimmedLandmark = meeshoLandmark.trim();

      if (!trimmedName || !trimmedHouse || !trimmedRoad) {
        return;
      }

      if (trimmedPhone.length !== 10) {
        setPhoneError(language === 'en' ? 'Provide a valid 10-digit phone number' : 'సరైన 10 అంకెల ఫోన్ నంబర్ ఇవ్వండి');
        return;
      }

      if (trimmedPincode.length !== 6) {
        setPincodeError(language === 'en' ? 'Pincode must be exactly 6 digits' : 'పిన్‌కోడ్ ఖచ్చితంగా 6 అంకెలు ఉండాలి');
        return;
      }

      // Format Meesho-style clean address details combining name, phone, house, area, city, and state
      const formedEn = `${trimmedName} | Phone: ${trimmedPhone}\n${trimmedHouse}, ${trimmedRoad}\nPIN: ${trimmedPincode}, ${trimmedCity}, ${trimmedState}${trimmedLandmark ? ` (Landmark: ${trimmedLandmark})` : ''}`;
      const formedTe = `${trimmedName} | ఫోన్: ${trimmedPhone}\n${trimmedHouse}, ${trimmedRoad}\nపిన్‌కోడ్: ${trimmedPincode}, ${trimmedCity}, ${trimmedState}${trimmedLandmark ? ` (గుర్తు: ${trimmedLandmark})` : ''}`;

      const newAddr: UserAddress = {
        id: `adr-${Date.now()}`,
        label: `${newLabel}`,
        labelTelugu: `${newLabel}`,
        addressLine: formedEn,
        addressLineTelugu: formedTe,
        isDefault: false,
        city: trimmedCity
      };

      setUserAddressList(prev => [...prev, newAddr]);
      setSelectedAddressId(newAddr.id);
      
      // Clear form states
      setMeeshoName('');
      setMeeshoPhone('');
      setMeeshoHouse('');
      setMeeshoRoad('');
      setMeeshoPincode('');
      setMeeshoCity('');
      setMeeshoState('');
      setMeeshoLandmark('');
    };

    const triggerGpsSimulation = () => {
      triggerSparkleSound();
      setGpsLoading(true);
      setTimeout(() => {
        setGpsLoading(false);
        setMeeshoName(userName || 'Ramakrishna');
        setMeeshoPhone('9876543210');
        setMeeshoHouse('Flat 405, Cyra Oasis Apartment');
        setMeeshoRoad('Road No. 36, Jubilee Hills near Metro Pillar 1635');
        setMeeshoPincode('500033');
        setMeeshoCity('Hyderabad');
        setMeeshoState('Telangana');
        setMeeshoLandmark('Near HDFC Bank Circle');
      }, 1500);
    };

    return (
      <div className={`h-full w-full flex flex-col justify-between ${isDarkMode ? 'bg-brand-charcoal text-white' : 'bg-brand-cream text-brand-charcoal'} transition-all`}>
        {/* Header */}
        <div className="flex items-center pt-10 pb-3 px-6 h-18 justify-between border-b border-brand-primary/5">
          <button 
            onClick={() => navTo(AppScreen.HOME)}
            className={`p-2.5 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-white shadow-xs'}`}
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="font-extrabold font-display text-sm">{language === 'en' ? 'Address Hub 📍' : 'నా చిరునామాలు 📍'}</h2>
          <div className="w-8 h-8" />
        </div>

        {/* Outer Scrollable block */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5">
          {/* Visual premium map representation mockup */}
          <div className="relative h-40 w-full rounded-3xl overflow-hidden shadow-xs border border-brand-primary/10">
            {/* Mock retro map paths and custom glowing pin */}
            <div className="absolute inset-0 bg-neutral-200 dark:bg-zinc-800 flex items-center justify-center">
              {/* Static visual vector elements */}
              <div className="absolute top-4 left-6 w-16 h-1.5 bg-white/40 dark:bg-black/30 rounded-full" />
              <div className="absolute bottom-10 right-8 w-24 h-1 bg-white/40 dark:bg-black/30 rounded-full" />
              <div className="absolute h-full w-2 bg-brand-primary/10 left-1/3 transform -rotate-12" />
              <div className="absolute w-full h-2 bg-brand-secondary/10 top-1/2 transform rotate-6 animate-pulse" />

              {/* Pulse marker */}
              <div className="relative flex flex-col items-center">
                <div className="absolute -top-1 w-2.5 h-2.5 bg-brand-secondary rounded-full animate-ping" />
                <span className="text-3xl filter drop-shadow-md z-10 animate-bounce select-none">🛵</span>
              </div>
            </div>

            {/* Float GPS button overlay */}
            <button 
              onClick={triggerGpsSimulation}
              className="absolute bottom-3 left-3 bg-brand-secondary hover:bg-brand-secondary/95 text-white px-3 py-1.5 rounded-xl text-[10px] font-black shadow-lg flex items-center space-x-1 active:scale-95 transition-all"
            >
              <Compass size={11} className={gpsLoading ? "animate-spin" : ""} />
              <span>{gpsLoading ? 'Syncing...' : 'Simulate GPS Pin 🎯'}</span>
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest">{t.savedAddresses}</h3>
            
            <div className="space-y-2.5 select-none animate-float-slow" style={{ animationDuration: '6s' }}>
              {userAddressList.length === 0 ? (
                <div className={`p-6 rounded-2.5xl text-center border border-dashed ${isDarkMode ? 'border-zinc-800 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
                  <p className="text-xs font-bold">{language === 'en' ? 'No custom locations added yet.' : 'ఇంకా చిరునామాలు జోడించబడలేదు.'}</p>
                  <p className="text-[10px] mt-1">{language === 'en' ? 'Use the form below to register your safe spot! 📍' : 'మీ సురక్షితమైన ప్రదేశాన్ని నమోదు చేసుకోండి! 📍'}</p>
                </div>
              ) : (
                userAddressList.map(addr => {
                  const isSel = selectedAddressId === addr.id;
                  // Handle custom emoji parsing
                  const emojiMatch = addr.label.match(/[\p{Emoji_Presentation}\p{Emoji}\u200d]+/gu);
                  const firstEmoji = emojiMatch ? emojiMatch[0] : '📍';
                  return (
                    <div
                      key={addr.id}
                      onClick={() => { triggerSparkleSound(); setSelectedAddressId(addr.id); }}
                      className={`p-3.5 rounded-2.5xl cursor-pointer border flex justify-between items-start transition-all ${
                        isSel 
                          ? 'border-brand-primary bg-brand-primary/10 ring-2 ring-brand-primary/20' 
                          : isDarkMode ? 'bg-black/15 border-white/5 hover:bg-black/30' : 'bg-white border-brand-primary/10 hover:bg-brand-cream-dark'
                      }`}
                    >
                      <div className="flex space-x-2.5 items-start">
                        <span className="text-xl leading-none">{firstEmoji}</span>
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs font-black">
                              {language === 'en' ? addr.label : addr.labelTelugu}
                            </h4>
                            {addr.isDefault && (
                              <span className="text-[8px] bg-brand-secondary text-white px-2 py-0.5 rounded-full font-bold uppercase">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 leading-normal max-w-[180px]">
                            {language === 'en' ? addr.addressLine : addr.addressLineTelugu}
                          </p>
                        </div>
                      </div>

                      <div className={`h-4 w-4 rounded-full border ${isSel ? 'border-brand-primary bg-brand-primary flex items-center justify-center text-white text-[9px]' : 'border-gray-300'}`}>
                        {isSel && <Check size={10} strokeWidth={4} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Form to add custom location */}
          <form 
            onSubmit={handleAddAddress}
            className={`p-5 rounded-3xl border space-y-4 ${isDarkMode ? 'bg-black/25 border-white/10' : 'bg-white border-brand-primary/10 shadow-xs'}`}
          >
            <div className="flex justify-between items-center pb-1 border-b border-brand-primary/5">
              <h4 className="text-xs font-black text-brand-primary uppercase tracking-wider">{t.addNewAddress}</h4>
              <span className="text-[9px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-md font-bold">Meesho Format</span>
            </div>
            
            {/* 1. CONTACT DETAILS GROUP */}
            <div className="space-y-2.5">
              <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Details 👤</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gray-500">{language === 'en' ? 'Receiver Name *' : 'స్వీకర్త పేరు *'}</span>
                  <input 
                    type="text"
                    required
                    value={meeshoName}
                    onChange={(e) => setMeeshoName(e.target.value)}
                    placeholder={language === 'en' ? 'Name' : 'పేరు'}
                    className={`w-full p-2.5 text-xs font-bold rounded-xl border outline-none focus:border-brand-primary ${
                      isDarkMode ? 'bg-black/15 border-white/10 text-white' : 'bg-neutral-50 border-gray-200 text-brand-charcoal'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gray-500">{language === 'en' ? 'Phone Number *' : 'ఫోన్ నంబర్ *'}</span>
                  <input 
                    type="tel"
                    required
                    maxLength={10}
                    value={meeshoPhone}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, '');
                      setMeeshoPhone(num);
                    }}
                    placeholder="10-digit Mobile"
                    className={`w-full p-2.5 text-xs font-mono font-bold rounded-xl border outline-none focus:border-brand-primary ${
                      isDarkMode ? 'bg-black/15 border-white/10 text-white' : 'bg-neutral-50 border-gray-200 text-brand-charcoal'
                    }`}
                  />
                  {phoneError && <span className="text-[8px] text-red-500 font-bold block mt-0.5">{phoneError}</span>}
                </div>
              </div>
            </div>

            {/* 2. ADDRESS SECRETS GROUP */}
            <div className="space-y-2.5">
              <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Address Details 📍</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gray-500">{language === 'en' ? 'Pincode *' : 'పిన్‌కోడ్ *'}</span>
                  <input 
                    type="text"
                    required
                    maxLength={6}
                    value={meeshoPincode}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, '');
                      setMeeshoPincode(num);
                    }}
                    placeholder="6-digit PIN"
                    className={`w-full p-2.5 text-xs font-mono font-bold rounded-xl border outline-none focus:border-brand-primary ${
                      isDarkMode ? 'bg-black/15 border-white/10 text-white' : 'bg-neutral-50 border-gray-200 text-brand-charcoal'
                    }`}
                  />
                  {pincodeError && <span className="text-[8px] text-red-500 font-bold block mt-0.5">{pincodeError}</span>}
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gray-500">{language === 'en' ? 'Nearby Landmark' : 'సమీప గుర్తు (ఆప్షనల్)'}</span>
                  <input 
                    type="text"
                    value={meeshoLandmark}
                    onChange={(e) => setMeeshoLandmark(e.target.value)}
                    placeholder="e.g. Near Metro Pillars"
                    className={`w-full p-2.5 text-xs font-bold rounded-xl border outline-none focus:border-brand-primary ${
                      isDarkMode ? 'bg-black/15 border-white/10 text-white' : 'bg-neutral-50 border-gray-200 text-brand-charcoal'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-500">{language === 'en' ? 'House No. / Building Name *' : 'ఇంటి నంబరు / భవనం పేరు *'}</span>
                <input 
                  type="text"
                  required
                  value={meeshoHouse}
                  onChange={(e) => setMeeshoHouse(e.target.value)}
                  placeholder="e.g. Flat 302, Royal Enclave"
                  className={`w-full p-2.5 text-xs font-bold rounded-xl border outline-none focus:border-brand-primary ${
                    isDarkMode ? 'bg-black/15 border-white/10 text-white' : 'bg-neutral-50 border-gray-200 text-brand-charcoal'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-500">{language === 'en' ? 'Road Name / Area / Colony *' : 'రోడ్డు పేరు / ప్రాంతం / కాలనీ *'}</span>
                <input 
                  type="text"
                  required
                  value={meeshoRoad}
                  onChange={(e) => setMeeshoRoad(e.target.value)}
                  placeholder="e.g. Jubilee Hills, Gachibowli Side"
                  className={`w-full p-2.5 text-xs font-bold rounded-xl border outline-none focus:border-brand-primary ${
                    isDarkMode ? 'bg-black/15 border-white/10 text-white' : 'bg-neutral-50 border-gray-200 text-brand-charcoal'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gray-500">{language === 'en' ? 'City *' : 'నగరం *'}</span>
                  <input 
                    type="text"
                    required
                    value={meeshoCity}
                    onChange={(e) => setMeeshoCity(e.target.value)}
                    placeholder="Hyderabad"
                    className={`w-full p-2.5 text-xs font-bold rounded-xl border outline-none focus:border-brand-primary ${
                      isDarkMode ? 'bg-black/15 border-white/10 text-white' : 'bg-neutral-50 border-gray-200 text-brand-charcoal'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gray-500">{language === 'en' ? 'State *' : 'రాష్ట్రం *'}</span>
                  <input 
                    type="text"
                    required
                    value={meeshoState}
                    onChange={(e) => setMeeshoState(e.target.value)}
                    placeholder="Telangana"
                    className={`w-full p-2.5 text-xs font-bold rounded-xl border outline-none focus:border-brand-primary ${
                      isDarkMode ? 'bg-black/15 border-white/10 text-white' : 'bg-neutral-50 border-gray-200 text-brand-charcoal'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* 3. SAVE ADDRESS AS GROUP */}
            <div className="space-y-2">
              <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{language === 'en' ? 'Save Address As' : 'చిరునామా రకం'}</span>
              
              <div className="flex flex-wrap gap-1.5 select-none animate-float-slow" style={{ animationDuration: '6s' }}>
                {[
                  { tag: 'Home 🏡', te: 'ఇల్లు 🏡' },
                  { tag: 'Work 💼', te: 'ఆఫీస్ 💼' },
                  { tag: 'Gym 🏋️', te: 'వ్యాయామశాల 🏋️' },
                  { tag: 'Oasis 🌴', te: 'నివాసం 🌴' },
                  { tag: 'Sweetheart 💖', te: 'ప్రియమైనవారు 💖' },
                  { tag: 'Friend 🐨', te: 'స్నేహితుడు 🐨' }
                ].map(item => {
                  const isS = newLabel === item.tag;
                  return (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => { triggerSparkleSound(); setNewLabel(item.tag); }}
                      className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                        isS 
                          ? 'bg-brand-secondary border-brand-secondary text-white' 
                          : isDarkMode ? 'bg-black/15 border-white/5 text-gray-400' : 'bg-neutral-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {language === 'en' ? item.tag : item.te}
                    </button>
                  );
                })}
              </div>

              {/* Enter Custom address label */}
              <input 
                type="text"
                required
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Custom Label (e.g. Grandma's Flat 🏡)"
                className={`w-full p-2 text-[10px] font-black rounded-lg border outline-none focus:border-brand-primary ${
                  isDarkMode ? 'bg-black/15 border-white/10 text-white' : 'bg-neutral-50 border-gray-200 text-brand-charcoal'
                }`}
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-black text-xs transition-all tracking-wider shadow-md hover:shadow-lg flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <Send size={11} />
              <span>{language === 'en' ? 'Add Location' : 'చిరునామా జోడించండి'}</span>
            </button>
          </form>
        </div>

        {/* Footer next navigation */}
        <div className={`p-5 border-t ${isDarkMode ? 'bg-brand-charcoal/80 border-white/10' : 'bg-white border-brand-primary/5'}`}>
          <button
            onClick={() => navTo(AppScreen.HOME)}
            className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-2xl font-black text-xs text-center flex justify-center items-center space-x-1"
          >
            {language === 'en' ? 'Back to Menu & Shop 🍳' : 'తిరిగి మెనూకు వెళ్ళండి 🍳'}
          </button>
        </div>
      </div>
    );
  }

  // 8. PAYMENT PAGE
  if (currentScreen === AppScreen.PAYMENT) {
    const handlePayNow = () => {
      triggerSparkleSound();
      setPaymentProcessing(true);
      
      // Simulate quick transition loader
      setTimeout(() => {
        setPaymentProcessing(false);
        setPaymentFinished(true);
        setActiveOrderStep(0); // Set order live step to "Preparing"
        
        // Append real order entry
        const newOrderId = `CY-${Math.floor(1000 + Math.random() * 9000)}`;
        const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const mainFood = cart[0] ? (FOOD_ITEMS.find(f => f.id === cart[0].foodId)?.name || 'Cozy Bites Meal') : 'Cozy Bites Meal';
        const newHistoryItem: OrderHistoryItem = {
          id: newOrderId,
          date: dateStr,
          foodName: mainFood + (cart.length > 1 ? ` + ${cart.length - 1} more` : ''),
          amount: orderPlacedTotal,
          status: 'Delivered'
        };
        setOrderHistory(prev => [newHistoryItem, ...prev]);

        setTimeout(() => {
          setPaymentFinished(false);
          // Set cart to empty after successful checkout
          setCart([]);
          navTo(AppScreen.TRACKING);
        }, 1800);
      }, 2000);
    };

    return (
      <div className={`h-full w-full flex flex-col justify-between ${isDarkMode ? 'bg-brand-charcoal text-white' : 'bg-brand-cream text-brand-charcoal'} transition-all`}>
        {/* Header */}
        <div className="flex items-center pt-10 pb-3 px-6 h-18 justify-between border-b border-brand-primary/5">
          <button 
            onClick={() => navTo(AppScreen.CART)}
            className={`p-2.5 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-white shadow-xs'}`}
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="font-extrabold font-display text-sm">{t.paymentTitle}</h2>
          <div className="w-8 h-8" />
        </div>

        {/* Scroll Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5">
          {/* Secure lock details */}
          <div className="flex items-center space-x-2 bg-brand-green/10 text-brand-green px-3.5 py-2.5 rounded-2xl text-[11px] font-extrabold">
            <ShieldCheck size={16} />
            <span>256-Bit SSL Encrypted Sweet Spoon Cooking Escrow Guard</span>
          </div>

          {/* Options */}
          <div className="space-y-3 select-none">
            <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest">{t.paymentSub}</h3>
            
            <div className="space-y-2.5">
              {[
                { key: 'cod', label: t.cod, emoji: '💵' },
                { key: 'phonepe', label: t.upiPhonePe, emoji: '🟣' },
                { key: 'gpay', label: t.upiGpay, emoji: '🟢' },
                { key: 'paytm', label: t.paytm, emoji: '🔵' }
              ].map(opt => {
                const isSelected = paymentMethod === opt.key;
                return (
                  <div
                    key={opt.key}
                    onClick={() => { triggerSparkleSound(); setPaymentMethod(opt.key as any); }}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-black shadow-xs' 
                        : isDarkMode ? 'bg-black/15 border-white/5 text-gray-300 hover:bg-black/25' : 'bg-white border-brand-primary/15 text-gray-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 text-xs font-extrabold">
                      <span className="text-lg leading-none">{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </div>
                    <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected ? 'border-brand-primary bg-brand-primary text-white' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check size={10} className="stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer totals payment */}
        <div className={`p-5 sticky bottom-0 border-t ${isDarkMode ? 'bg-brand-charcoal/80 border-white/10' : 'bg-white border-brand-primary/5'}`}>
          <div className="flex justify-between items-center pb-3 text-xs font-black select-none">
            <span className="text-gray-400">GRAND COOKING TOTAL</span>
            <span className="text-brand-secondary text-lg">₹{orderPlacedTotal}</span>
          </div>

          <button
            onClick={handlePayNow}
            className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-2xl font-black text-xs shadow-lg shadow-brand-primary/10 hover:shadow-brand-primary/30 transition-all text-center flex justify-center items-center space-x-1"
          >
            <span>{t.placeOrder} (₹{orderPlacedTotal})</span>
          </button>
        </div>

        {/* Full-screen simulated micro transitions overlay */}
        <AnimatePresence>
          {paymentProcessing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-center items-center text-center p-8 space-y-4"
            >
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-dashed border-brand-primary rounded-full animate-spin" />
                <span className="text-4xl select-none animate-bounce">🍩</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-white font-display">Mixing Batter with Love!</h4>
                <p className="text-xs text-brand-primary animate-pulse font-mono font-bold">Securing cooking slot at kitchen...</p>
              </div>
            </motion.div>
          )}

          {paymentFinished && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-b from-brand-yellow/30 to-brand-secondary/30 backdrop-blur-md z-50 flex flex-col justify-center items-center text-center p-8 space-y-5"
            >
              <div className="w-20 h-20 bg-brand-green text-white rounded-full flex items-center justify-center shadow-xl animate-bounce">
                <Check size={44} strokeWidth={4} />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-brand-charcoal font-display">{t.paymentSuccess}</h4>
                <p className="text-xs text-brand-secondary font-bold">{t.rideStart}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 9. LIVE ORDER TRACKING PAGE
  if (currentScreen === AppScreen.TRACKING) {
    // Stepped tracker descriptions
    const steps = [
      { id: 0, label: t.orderStat_prep, icon: '🍳', desc: 'Spatulas are flying, ingredients are roaring!' },
      { id: 1, label: t.orderStat_picked, icon: '📦', desc: 'Rider received hot insulated box!' },
      { id: 2, label: t.orderStat_way, icon: '🛵', desc: 'Scooter is flying over Jubilee Gated Highway!' },
      { id: 3, label: t.orderStat_delivered, icon: '✨', desc: 'Warm bite landed! Eat and stay happy!' }
    ];

    return (
      <div className={`h-full w-full flex flex-col justify-between ${isDarkMode ? 'bg-brand-charcoal text-white' : 'bg-brand-cream text-brand-charcoal'} transition-all`}>
        {/* Header */}
        <div className="flex items-center pt-10 pb-3 px-6 h-18 justify-between border-b border-brand-primary/5">
          <button 
            onClick={() => navTo(AppScreen.HOME)}
            className={`p-2.5 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-white shadow-xs'}`}
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="font-extrabold font-display text-sm">{t.trackingTitle} 🛵</h2>
          <div className="w-8 h-8" />
        </div>

        {/* Center content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5 select-none">
          
          {/* Cozy Nighttime Delivery Live Map */}
          <div className="relative h-44 w-full rounded-3xl overflow-hidden shadow-md border border-brand-primary/10">
            <div className="absolute inset-0 bg-[#242F3E] flex items-center justify-center">
              {/* Retro Night road graphics */}
              <div className="absolute h-1 bg-white/20 w-full top-1/2 transform -translate-y-1/2" />
              <div className="absolute h-full bg-white/20 w-1 left-1.5/3" />
              <div className="absolute bottom-12 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
              <div className="absolute top-10 right-14 w-3.5 h-3.5 bg-brand-green/20 rounded-full blur-xs" />
              
              {/* Home destination marker icon */}
              <div className="absolute right-12 top-11 text-center font-bold">
                <span className="text-xl">🏡</span>
                <span className="block text-[8px] text-white tracking-widest font-mono">HOME</span>
              </div>

              {/* Animated scooter riding along the route line */}
              <div className="absolute left-6 top-1/2 -translate-y-7 animate-scooter text-center">
                <span className="text-4xl block leading-none filter drop-shadow-md">🛵</span>
                <div className="w-2.5 h-1 bg-black/40 rounded-full mx-auto blur-xs" />
              </div>
            </div>

            {/* Float ETA Banner */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-3.5 py-1.5 rounded-2xl text-[10px] font-black shadow-lg">
              <span className="text-brand-yellow animate-pulse text-[11px] block text-center font-display">12 MINUTES LEFT</span>
              <span className="opacity-90">{t.etaText} ✨</span>
            </div>
          </div>

          {/* Stepped interactive tracker status lines */}
          <div className="space-y-4 pt-1">
            <div className="flex justify-between items-center text-xs font-black">
              <span className="text-brand-primary tracking-wider uppercase">Order Milestone Status</span>
              <span className="text-[10px] font-mono text-gray-400">Order ID: #CY-8921</span>
            </div>

            <div className="space-y-3.5">
              {steps.map(step => {
                const isActive = activeOrderStep >= step.id;
                return (
                  <div 
                    key={step.id}
                    onClick={() => { triggerSparkleSound(); setActiveOrderStep(step.id); }}
                    className={`flex items-start space-x-3 p-3 rounded-2xl cursor-pointer border transition-all ${
                      isActive 
                        ? 'bg-brand-primary/10 border-brand-primary text-brand-primary ' 
                        : isDarkMode ? 'bg-black/20 border-white/5 opacity-40 hover:opacity-75' : 'bg-white border-brand-primary/10 opacity-50 hover:opacity-80'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${isActive ? 'bg-brand-secondary text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {step.icon}
                    </div>

                    <div className="flex-1 text-left space-y-0.5">
                      <h4 className="text-xs font-black">{step.label}</h4>
                      <p className="text-[10px] text-gray-400 font-bold">{step.desc}</p>
                    </div>

                    <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-brand-primary bg-brand-primary text-white text-[9px]' : 'border-gray-300'}`}>
                      {isActive && <Check size={10} strokeWidth={4} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer return */}
        <div className={`p-5 border-t ${isDarkMode ? 'bg-brand-charcoal/80 border-white/10' : 'bg-white border-brand-primary/5'}`}>
          <button
            onClick={() => navTo(AppScreen.HOME)}
            className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-2xl font-black text-xs text-center flex justify-center items-center space-x-1"
          >
            <span>Explore Menu & Buy More 💖</span>
          </button>
        </div>
      </div>
    );
  }
  if (currentScreen === AppScreen.PROFILE) {
    return (
      <div className={`h-full w-full flex flex-col justify-between ${isDarkMode ? 'bg-brand-charcoal text-white' : 'bg-brand-cream text-brand-charcoal'} transition-all`}>
        {/* Header */}
        <div className="flex items-center pt-10 pb-3 px-6 h-18 justify-between border-b border-brand-primary/5">
          <div className="w-8 h-8" />
          <h2 className="font-extrabold font-display text-sm">{t.profileTitle}</h2>
          <div className="w-8 h-8" />
        </div>

        {/* Scroll body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          {/* Cozy avatar design with selection option */}
          <div className="flex flex-col items-center justify-center text-center space-y-3 select-none">
            <div className="relative">
              {/* Outer halo */}
              <div className="absolute inset-0 bg-brand-primary/10 rounded-full blur-md animate-pulse" />
              <button 
                onClick={() => { triggerSparkleSound(); setIsSelectingAvatar(!isSelectingAvatar); }}
                className="relative h-20 w-20 rounded-full bg-gradient-to-tr from-brand-secondary to-brand-primary p-1 cursor-pointer hover:scale-105 active:scale-95 transition-all block focus:outline-none"
                title="Tap to change your food avatar shape"
              >
                <div className="h-full w-full bg-brand-cream dark:bg-zinc-855 rounded-full flex items-center justify-center text-4xl">
                  {userAvatar}
                </div>
              </button>
            </div>

            {/* Avatar picker grid */}
            <AnimatePresence>
              {isSelectingAvatar && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-3 rounded-2xl bg-neutral-100/80 dark:bg-black/35 border border-brand-primary/10 grid grid-cols-5 gap-2 max-w-[240px] mx-auto"
                >
                  {['🐼', '🦊', '🐨', '🐯', '🐰', '🦁', '🐱', '🐻', '🦉', '🐣'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => { triggerSparkleSound(); setUserAvatar(emoji); setIsSelectingAvatar(false); }}
                      className="text-2xl hover:scale-125 hover:rotate-12 transition-transform p-1 rounded-lg focus:outline-none"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inline Name Editor */}
            <div className="space-y-1">
              {isEditingName ? (
                <div className="flex items-center space-x-2 justify-center">
                  <input 
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="px-3 py-1 text-sm font-extrabold rounded-lg border border-brand-primary outline-none max-w-[150px] text-brand-charcoal bg-white"
                    placeholder="Enter name..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setUserName(tempName.trim() || 'Chandra Mama');
                        setIsEditingName(false);
                      }
                    }}
                  />
                  <button 
                    onClick={() => { triggerSparkleSound(); setUserName(tempName.trim() || 'Chandra Mama'); setIsEditingName(false); }}
                    className="bg-brand-primary text-white p-1 rounded-md text-xs font-bold active:scale-90"
                  >
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-1.5 cursor-pointer" onClick={() => { triggerSparkleSound(); setTempName(userName); setIsEditingName(true); }}>
                  <h3 className="text-base font-extrabold font-display select-text">{userName}</h3>
                  <span className="text-xs opacity-70 hover:opacity-100 cursor-pointer" title="Edit your name">✏️</span>
                </div>
              )}
              <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">
                {firebaseUser ? `${firebaseUser.email} 🔐` : (language === 'en' ? 'Verified Cozy Foodie' : 'ధృవీకరించబడిన రుచికరమైన భోజనప్రియులు')}
              </p>
            </div>
          </div>



          {/* Quick options */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-brand-primary uppercase tracking-widest">Settings & Tuning 🛠️</h4>

            <div className="space-y-2 select-none">
              
              {/* Language toggle option */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-black/15 border-white/5' : 'bg-white border-brand-primary/10'}`}>
                <div className="flex items-center space-x-2 text-xs font-bold">
                  <Languages size={15} className="text-brand-secondary" />
                  <span>{t.languageLabel}</span>
                </div>

                <div className="flex space-x-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
                  <button 
                    onClick={() => { triggerSparkleSound(); setLanguage('en'); }}
                    className="text-[10px] font-black px-2.5 py-1 rounded-md"
                    style={{ backgroundColor: language === 'en' ? '#FF9E59' : 'transparent', color: language === 'en' ? '#FFF' : '#888' }}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => { triggerSparkleSound(); setLanguage('te'); }}
                    className="text-[10px] font-black px-2.5 py-1 rounded-md"
                    style={{ backgroundColor: language === 'te' ? '#FF9E59' : 'transparent', color: language === 'te' ? '#FFF' : '#888' }}
                  >
                    TE
                  </button>
                </div>
              </div>

              {/* Dark mode toggle option */}
              <div 
                onClick={() => { triggerSparkleSound(); setIsDarkMode(!isDarkMode); }}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer ${isDarkMode ? 'bg-black/15 border-white/5' : 'bg-white border-brand-primary/10'}`}
              >
                <div className="flex items-center space-x-2 text-xs font-bold">
                  <Moon size={15} className="text-brand-primary" />
                  <span>{t.darkModeLabel}</span>
                </div>

                <div className="flex items-center">
                  <div className="w-9 h-5 bg-brand-primary/30 rounded-full p-0.5 relative">
                    <div className={`w-4 h-4 bg-brand-primary rounded-full transform transition-transform duration-300 ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>

              {/* Firebase Sign Out option */}
              {firebaseUser && (
                <div 
                  onClick={async () => { 
                    triggerSparkleSound(); 
                    if (onSignOut) await onSignOut(); 
                  }}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer ${isDarkMode ? 'bg-red-500/10 border-red-500/25 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}
                >
                  <div className="flex items-center space-x-2 text-xs font-bold font-display uppercase tracking-wider">
                    <ShieldCheck size={15} className="text-red-500" />
                    <span>{language === 'en' ? 'Google Sign Out' : 'గూగుల్ లాగౌట్'}</span>
                  </div>
                  <span className="text-[9px] font-mono opacity-80">{firebaseUser.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Order history block with button instead of raw list */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-black text-brand-primary uppercase tracking-widest">{t.orderHistory}</h4>
            
            <button
              onClick={() => { triggerSparkleSound(); setShowHistoryModal(true); }}
              className="w-full py-4 mt-2 px-5 bg-gradient-to-r from-brand-secondary to-brand-primary text-white rounded-2xl font-extrabold text-xs tracking-wider shadow-md hover:scale-[1.01] active:scale-95 transition-all text-center flex justify-center items-center space-x-2"
            >
              <span>View Order Receipts history 📜</span>
            </button>
          </div>
        </div>

        {/* Interactive Order History Modal Overlay */}
        <AnimatePresence>
          {showHistoryModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center"
            >
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 20 }}
                className={`w-full max-h-[80%] rounded-t-3xl p-6 ${isDarkMode ? 'bg-zinc-900 text-white border-t border-white/10' : 'bg-white text-brand-charcoal border-t border-brand-primary/15'} flex flex-col shadow-2xl overflow-hidden`}
              >
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-white/5">
                  <h3 className="text-sm font-extrabold text-brand-primary uppercase tracking-wider">{t.orderHistory} 📜</h3>
                  <button 
                    onClick={() => { triggerSparkleSound(); setShowHistoryModal(false); }}
                    className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-gray-400 font-extrabold text-xs"
                  >
                    ✕
                  </button>
                </div>

                {/* Body - Scrollable orders */}
                <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-3.5">
                  {orderHistory.length === 0 ? (
                    <div className="text-center py-12 space-y-2">
                      <span className="text-4xl">🥘</span>
                      <p className="text-xs text-gray-400 font-bold">No orders cooked yet! Let's fill the table.</p>
                    </div>
                  ) : (
                    orderHistory.map(hist => (
                      <div 
                        key={hist.id}
                        className={`p-3.5 rounded-2xl border flex justify-between items-center transition-all ${
                          isDarkMode ? 'bg-neutral-800/40 border-white/5' : 'bg-neutral-50 border-gray-100'
                        }`}
                      >
                        <div className="text-left space-y-0.5">
                          <h5 className="text-xs font-black">{hist.foodName}</h5>
                          <p className="text-[10px] text-gray-400 font-medium">{hist.date}  •  <span className="font-bold text-brand-secondary">{hist.id}</span></p>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <div className="text-sm font-black text-brand-secondary">₹{hist.amount}</div>
                          <span className="text-[9px] bg-brand-green/10 text-brand-green px-2.5 py-0.5 rounded-full font-extrabold">
                            {hist.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer close */}
                <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                  <button
                    onClick={() => { triggerSparkleSound(); setShowHistoryModal(false); }}
                    className="w-full py-3 bg-brand-primary text-white text-xs font-black rounded-xl transition-all"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
};
