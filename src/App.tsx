/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Smartphone, Moon, Sun, Volume2, Globe, Heart, ShoppingBag, 
  MapPin, Send, AlertCircle, Award, Coffee, Pizza, RotateCcw, 
  Trash2, ShieldCheck, ChevronRight, Bell, Info, Laptop, Wifi, BatteryFull
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Unified imports for types & screens
import { AppScreen, FoodItem, CartItem, UserAddress, OrderHistoryItem, AppNotification } from './types';
import { FOOD_ITEMS, SAVED_ADDRESSES, MOCK_NOTIFICATIONS, INITIAL_ORDER_HISTORY } from './data';
import { UiScreens } from './components/UiScreens';

// Firebase core integrations
import { 
  auth, 
  db, 
  googleProvider, 
  OperationType, 
  handleFirestoreError 
} from './lib/firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot, 
  deleteDoc 
} from 'firebase/firestore';

export default function App() {
  // Screen Router state
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.SPLASH);
  
  // Custom states that flow down to simulator
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([
    { foodId: 't1', quantity: 1 }, // Seed masala dosa as initial helper
    { foodId: 'd1', quantity: 2 }  // Seed sweet lassi
  ]);
  const [favorites, setFavorites] = useState<string[]>(['t1', 'm1', 'de1']);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>('t1');
  const [userAddressList, setUserAddressList] = useState<UserAddress[]>(SAVED_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [activeOrderStep, setActiveOrderStep] = useState<number>(0);
  const [orderPlacedTotal, setOrderPlacedTotal] = useState<number>(290);
  const [rewardsPoints, setRewardsPoints] = useState<number>(310);
  const [userName, setUserName] = useState<string>('Chandra Mama');
  const [userAvatar, setUserAvatar] = useState<string>('🐼');
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>(INITIAL_ORDER_HISTORY);

  // Firebase auth sync states
  const [fbUser, setFbUser] = useState<any | null>(null);
  const [fbLoading, setFbLoading] = useState<boolean>(true);

  // Authenticate triggers
  const handleGoogleSignIn = async () => {
    try {
      setFbLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      return res.user;
    } catch (e) {
      console.error("Sign-in with Google failed: ", e);
    } finally {
      setFbLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setFbLoading(true);
      await signOut(auth);
      setCart([
        { foodId: 't1', quantity: 1 },
        { foodId: 'd1', quantity: 2 }
      ]);
      setFavorites(['t1', 'm1', 'de1']);
      setUserAddressList(SAVED_ADDRESSES);
      setSelectedAddressId('');
      setOrderHistory(INITIAL_ORDER_HISTORY);
      setUserName('Chandra Mama');
      setUserAvatar('🐼');
      setRewardsPoints(310);
      setCurrentScreen(AppScreen.ONBOARDING);
    } catch (e) {
      console.error("Sign out failed: ", e);
    } finally {
      setFbLoading(false);
    }
  };

  // Setup Firestore listener loops
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (loadedUser) => {
      setFbLoading(true);
      if (loadedUser) {
        setFbUser(loadedUser);
        
        // Read/Write profile document from /users/{uid}
        const userRef = doc(db, 'users', loadedUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserName(data.name || loadedUser.displayName || 'Panda Foodie');
            setUserAvatar(data.avatar || '🐼');
            setRewardsPoints(data.rewardsPoints ?? 250);
            setFavorites(data.favorites ?? []);
            setCart(data.cart ?? []);
          } else {
            // Unregistered user - set initial document
            await setDoc(userRef, {
              uid: loadedUser.uid,
              name: loadedUser.displayName || 'Panda Foodie',
              avatar: '🐼',
              rewardsPoints: 250,
              favorites: favorites,
              cart: cart
            });
            setUserName(loadedUser.displayName || 'Panda Foodie');
            setUserAvatar('🐼');
            setRewardsPoints(250);
          }
        } catch (e) {
          console.warn("Profile fetching warning:", e);
        }

        // Subcollection Addresses snapshot loop
        const addrsCol = collection(db, 'users', loadedUser.uid, 'addresses');
        const unsubAddrs = onSnapshot(addrsCol, (snapshot) => {
          const list: UserAddress[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as UserAddress);
          });
          setUserAddressList(list);
          if (list.length > 0) {
            const defaultAddr = list.find(a => a.isDefault);
            setSelectedAddressId(defaultAddr ? defaultAddr.id : list[0].id);
          } else {
            setSelectedAddressId('');
          }
        }, (error) => {
          console.error("Addresses snapshot failing: ", error);
        });

        // Subcollection Orders snapshot loop
        const ordersCol = collection(db, 'users', loadedUser.uid, 'orders');
        const unsubOrders = onSnapshot(ordersCol, (snapshot) => {
          const list: OrderHistoryItem[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as OrderHistoryItem);
          });
          setOrderHistory(list);
        }, (error) => {
          console.error("Orders snapshot failing: ", error);
        });

        setFbLoading(false);

        return () => {
          unsubAddrs();
          unsubOrders();
        };
      } else {
        setFbUser(null);
        setFbLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync basic state updates to the Firestore profile document inside a debounced hook
  useEffect(() => {
    if (!fbUser) return;

    const pushProfileUpdate = async () => {
      const userRef = doc(db, 'users', fbUser.uid);
      try {
        await updateDoc(userRef, {
          name: userName,
          avatar: userAvatar,
          rewardsPoints: rewardsPoints,
          favorites: favorites,
          cart: cart
        });
      } catch (e) {
        console.warn("Debounced profile updates synced failed (safe to ignore if initialization logs it):", e);
      }
    };

    const delayHandler = setTimeout(pushProfileUpdate, 750);
    return () => clearTimeout(delayHandler);
  }, [userName, userAvatar, rewardsPoints, favorites, cart, fbUser]);

  // Intercepting helpers to keep subcollections matching state setters
  const handleSetUserAddressList = async (action: React.SetStateAction<UserAddress[]>) => {
    let nextList: UserAddress[] = [];
    if (typeof action === 'function') {
      nextList = action(userAddressList);
    } else {
      nextList = action;
    }

    if (fbUser) {
      // Find diffs to set
      for (const item of nextList) {
        const found = userAddressList.find(a => a.id === item.id);
        if (!found || JSON.stringify(found) !== JSON.stringify(item)) {
          const addrDoc = doc(db, 'users', fbUser.uid, 'addresses', item.id);
          await setDoc(addrDoc, item).catch(err => {
            handleFirestoreError(err, OperationType.CREATE, `users/${fbUser.uid}/addresses/${item.id}`);
          });
        }
      }

      // Find diffs to delete
      for (const old of userAddressList) {
        if (!nextList.find(item => item.id === old.id)) {
          const addrDoc = doc(db, 'users', fbUser.uid, 'addresses', old.id);
          await deleteDoc(addrDoc).catch(err => {
            handleFirestoreError(err, OperationType.DELETE, `users/${fbUser.uid}/addresses/${old.id}`);
          });
        }
      }
    } else {
      setUserAddressList(nextList);
    }
  };

  const handleSetOrderHistory = async (action: React.SetStateAction<OrderHistoryItem[]>) => {
    let nextList: OrderHistoryItem[] = [];
    if (typeof action === 'function') {
      nextList = action(orderHistory);
    } else {
      nextList = action;
    }

    if (fbUser) {
      for (const item of nextList) {
        const found = orderHistory.find(o => o.id === item.id);
        if (!found || JSON.stringify(found) !== JSON.stringify(item)) {
          const orderDoc = doc(db, 'users', fbUser.uid, 'orders', item.id);
          await setDoc(orderDoc, item).catch(err => {
            handleFirestoreError(err, OperationType.CREATE, `users/${fbUser.uid}/orders/${item.id}`);
          });
        }
      }
    } else {
      setOrderHistory(nextList);
    }
  };

  // Sound Synth enable state
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);

  // Phone OS Mock stats
  const [simTime, setSimTime] = useState('09:41');
  const [simBattery, setSimBattery] = useState(100);

  // Active push notification banner state inside the phone
  const [activePush, setActivePush] = useState<AppNotification | null>(null);
  const [customNotifyText, setCustomNotifyText] = useState('');

  // Update mock phone time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hrs = now.getHours();
      let mins = now.getMinutes();
      const stringMins = mins < 10 ? `0${mins}` : mins;
      const stringHrs = hrs < 10 ? `0${hrs}` : hrs;
      setSimTime(`${stringHrs}:${stringMins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio chime synthesizer
  const playPushChime = () => {
    if (!isSoundOn) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Chime sequence: High note then warm resolved note
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };

      playTone(1046.50, 0, 0.25); // C6 Note
      playTone(1318.51, 0.12, 0.4); // E6 Note
    } catch (e) {
      // Sandbox fallback - quiet
    }
  };

  // Helper to push random notification
  const dispatchPush = (notifyObj: AppNotification) => {
    playPushChime();
    // Slide notification down
    setActivePush(notifyObj);

    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      setActivePush(null);
    }, 5500);

    return () => clearTimeout(timer);
  };

  const dispatchCustomPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNotifyText.trim()) return;

    const customNotif: AppNotification = {
      id: `custom-${Date.now()}`,
      timeLabel: 'Now',
      message: customNotifyText,
      messageTelugu: customNotifyText,
      icon: '✨',
      type: 'custom'
    };

    dispatchPush(customNotif);
    setCustomNotifyText('');
  };

  // Safe screen changes
  const handleNavigate = (scr: AppScreen) => {
    setCurrentScreen(scr);
  };

  // Toggle Favorite handler
  const handleToggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(fId => fId !== id));
    } else {
      setFavorites(prev => [...prev, id]);
    }
    // play a micro sound
    try {
      if (isSoundOn) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch (e) {}
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center ${
      isDarkMode 
        ? 'bg-[#120F0D] text-gray-100 selection:bg-[#FF9E59]/40' 
        : 'bg-[#FAF7F2] text-gray-800 selection:bg-[#FF8596]/30'
    } transition-colors duration-500 font-sans p-0 sm:p-6 relative overflow-hidden`}>
      
      {/* Decorative Warm Blurred Backdrops */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#FF9E59]/4 rounded-full blur-3xl pointer-events-none select-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#FF8596]/4 rounded-full blur-3xl pointer-events-none select-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

      {/* Main Container - Desktop-centered, mobile-responsive */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md flex flex-col items-center justify-center">

        {/* Elegant Phone Bezels Frame (on desktop, disappears on actual mobile) */}
        <div className="relative w-full sm:w-[385px] h-screen sm:h-[795px] sm:rounded-[52px] sm:bg-zinc-900 sm:border-[10px] sm:border-zinc-800 sm:shadow-2xl sm:p-3 flex flex-col overflow-hidden group">
          
          {/* Top speaker grill physical mockup bar - sm only */}
          <div className="hidden sm:flex absolute top-1 left-12 right-12 h-6 justify-center items-center z-40 select-none">
            <div className="w-1.5 h-1.5 bg-neutral-900 rounded-full mr-2.5" />
            <div className="w-24 h-4 bg-black rounded-xl border border-white/5 flex items-center justify-center p-0.5">
              <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full border border-zinc-800 shadow-inner mr-2" />
              <div className="w-2 h-2 bg-blue-950 rounded-full" />
            </div>
          </div>

          {/* Inner phone screen container */}
          <div className={`flex-1 w-full h-full sm:rounded-[40px] overflow-hidden flex flex-col relative transition-all duration-300 ${
            isDarkMode ? 'bg-[#1C1816] text-white border-zinc-900' : 'bg-brand-cream text-brand-charcoal border-white/40'
          }`}>
            
            {/* Top OS status bar details mockup */}
            <div className="h-10 w-full flex justify-between items-center px-6 pt-2.5 z-30 select-none font-bold text-xs">
              <span className={isDarkMode ? 'text-white' : 'text-brand-charcoal'}>{simTime}</span>
              <div className="flex items-center space-x-1.5">
                <Wifi size={12} className={isDarkMode ? 'text-white' : 'text-brand-charcoal'} />
                <span className="text-[10px] tracking-tight">5G</span>
                <BatteryFull size={14} className={isDarkMode ? 'text-brand-yellow' : 'text-brand-secondary'} />
              </div>
            </div>

            {/* SLIDE-DOWN SYSTEM PUSH NOTIFICATION SIMULATION */}
            <AnimatePresence>
              {activePush && (
                <motion.div 
                  initial={{ y: -65, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -65, opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 14 }}
                  onClick={() => { setActivePush(null); setCurrentScreen(AppScreen.PROFILE); }}
                  className="absolute top-11 left-3 right-3 z-50 p-3 rounded-2xl glass-effect shadow-xl border border-brand-primary/20 flex space-x-3 items-center cursor-pointer hover:opacity-95 select-none"
                >
                  <div className="h-9 w-9 bg-gradient-to-tr from-brand-primary to-brand-secondary text-white rounded-xl shadow-xs flex items-center justify-center text-lg">
                    {activePush.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-center text-[9px] font-black text-brand-secondary">
                      <span>CYRA BITE ALERT 🛵</span>
                      <span className="font-mono text-[8px] opacity-70">Just Now</span>
                    </div>
                    <p className="text-[11px] font-extrabold leading-tight text-brand-charcoal mt-0.5">
                      {language === 'en' ? activePush.message : activePush.messageTelugu}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* THE LIVE SYSTEM SCREENS COMPONENT MOUNT */}
            <div className="flex-1 w-full h-full relative overflow-hidden">
              <UiScreens 
                currentScreen={currentScreen}
                onNavigate={handleNavigate}
                language={language}
                setLanguage={setLanguage}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                cart={cart}
                setCart={setCart}
                favorites={favorites}
                toggleFavorite={handleToggleFavorite}
                selectedFoodId={selectedFoodId}
                setSelectedFoodId={setSelectedFoodId}
                userAddressList={userAddressList}
                setUserAddressList={handleSetUserAddressList}
                selectedAddressId={selectedAddressId}
                setSelectedAddressId={setSelectedAddressId}
                activeOrderStep={activeOrderStep}
                setActiveOrderStep={setActiveOrderStep}
                orderPlacedTotal={orderPlacedTotal}
                setOrderPlacedTotal={setOrderPlacedTotal}
                rewardsPoints={rewardsPoints}
                setRewardsPoints={setRewardsPoints}
                userName={userName}
                setUserName={setUserName}
                userAvatar={userAvatar}
                setUserAvatar={setUserAvatar}
                orderHistory={orderHistory}
                setOrderHistory={handleSetOrderHistory}
                firebaseUser={fbUser}
                firebaseLoading={fbLoading}
                onGoogleSignIn={handleGoogleSignIn}
                onSignOut={handleSignOut}
              />
            </div>

            {/* Premium bottom system navigation bar */}
            <div className="h-14 w-full flex justify-around items-center px-4 bg-black/5 dark:bg-black/25 border-t border-brand-primary/5 z-20 select-none">
              {[
                { scr: AppScreen.HOME, icon: <Pizza size={16} />, label: language === 'en' ? 'Bites' : 'మెనూ' },
                { scr: AppScreen.CART, icon: <ShoppingBag size={16} />, label: language === 'en' ? 'Order' : 'ఆర్డర్' },
                { scr: AppScreen.TRACKING, icon: <MapPin size={16} />, label: language === 'en' ? 'Tracker' : 'ట్రాకర్' },
                { scr: AppScreen.PROFILE, icon: <Award size={16} />, label: language === 'en' ? 'Me' : 'ప్రొఫైల్' }
              ].map(tab => {
                const isA = currentScreen === tab.scr;
                return (
                  <button
                    key={tab.scr}
                    onClick={() => { playPushChime(); setCurrentScreen(tab.scr); }}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                      isA ? 'text-brand-secondary scale-110 font-extrabold' : 'text-gray-400 font-bold hover:text-gray-600'
                    }`}
                  >
                    {tab.icon}
                    <span className="text-[9px] mt-0.5 tracking-tighter">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom physical home indicator pill mock */}
            <div className="h-5 w-full flex justify-center items-center pb-2 z-20 select-none">
              <div className="w-32 h-1 bg-zinc-600 rounded-full" />
            </div>
          </div>
        </div>

      </div>

      {/* Subtle Floating Interactive Menu in bottom-right (for reset/audio options) */}
      <div className="hidden md:flex absolute bottom-4 right-4 items-center space-x-3 z-50">
        {/* Reset */}
        <button 
          onClick={() => {
            playPushChime();
            setCart([
              { foodId: 't1', quantity: 1 },
              { foodId: 'd1', quantity: 2 }
            ]);
            setFavorites(['t1', 'm1', 'de1']);
            setSelectedFoodId('t1');
            setUserAddressList(SAVED_ADDRESSES);
            setSelectedAddressId('');
            setActiveOrderStep(0);
            setRewardsPoints(250);
            setCurrentScreen(AppScreen.SPLASH);
          }}
          title="Reset Session"
          className={`p-3.5 rounded-full shadow-lg border transition-all ${
            isDarkMode 
              ? 'bg-[#1C1816]/90 hover:bg-neutral-800 text-brand-secondary border-neutral-800' 
              : 'bg-white/90 hover:bg-neutral-100 text-brand-secondary border-neutral-200'
          }`}
        >
          <RotateCcw size={16} className="animate-spin" style={{ animationDuration: '6s' }} />
        </button>

        {/* Audio */}
        <button
          onClick={() => { setIsSoundOn(!isSoundOn); playPushChime(); }}
          title={isSoundOn ? 'Mute Sounds' : 'Unmute Sounds'}
          className={`p-3.5 rounded-full shadow-lg border transition-all ${
            isDarkMode 
              ? 'bg-[#1C1816]/90 hover:bg-neutral-800 text-white border-neutral-800' 
              : 'bg-white/90 hover:bg-neutral-100 text-neutral-800 border-neutral-200'
          }`}
        >
          {isSoundOn ? '🔊' : '🔇'}
        </button>
      </div>

    </div>
  );
}
