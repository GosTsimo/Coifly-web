import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';
import { useSalonOwnerData } from '../../hooks/useSalonOwnerData';
import { useAuthStore } from '../../store/authStore';

// ═══════════════════════════════════════════════════════════════
// ── CONSTANTS ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  // Primary - Doré Barberia
  primary: '#c39c56',
  primaryLight: '#d4b875',
  primaryDark: '#b8893d',

  // Secondary
  secondary: '#f59e0b',
  secondaryLight: '#fbbf24',
  secondaryDark: '#d97706',

  // Background & Surface - Dark theme
  background: '#0B0B0F',
  surface: '#1C1C1E',
  surfaceLight: '#2C2C2E',
  surfaceElevated: '#3C3C3E',
  card: '#1E293B',

  // Text Colors
  white: '#FFFFFF',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDisabled: '#475569',

  // Neutral/Gray
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // Status Colors
  success: '#10B981',
  successLight: '#d1fae5',
  successDark: '#065f46',

  error: '#EF4444',
  errorLight: '#fee2e2',
  errorDark: '#7f1d1d',

  warning: '#F59E0B',
  warningLight: '#fef3c7',
  warningDark: '#92400e',

  info: '#3B82F6',
  infoLight: '#dbeafe',
  infoDark: '#1e3a8a',

  // Border & Divider
  border: '#2C2C2E',
  borderLight: '#3C3C3E',
  divider: '#2C2C2E',

  // Transparent
  transparent: 'rgba(0, 0, 0, 0)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.25)',

  // Gradient
  gradientStart: '#c39c56',
  gradientEnd: '#f59e0b',
};

// ── Données de test ─────────────────────────────────────────
const MOCK_SALON = {
  name: 'Beauty Luxe',
  photo: null,
  status: 'open',
  openTime: '09:00',
  closeTime: '19:00',
};

const MOCK_STATS = {
  todayBookings: 6,
  todayRevenue: 1200,
  pendingCount: 2,
};

const MOCK_NEXT_BOOKING = {
  id: 'next1',
  time: '10:00',
  client: 'Salma',
  service: 'Brushing',
  duration: 45,
  price: 100,
};

const MOCK_BOOKINGS = [
  { id: 'b1', time: '10:00', client: 'Salma', service: 'Brushing', status: 'confirmed', price: 100 },
  { id: 'b2', time: '11:00', client: 'Lina', service: 'Coupe', status: 'pending', price: 80 },
  { id: 'b3', time: '13:00', client: 'Sara', service: 'Coloration', status: 'confirmed', price: 200 },
  { id: 'b4', time: '15:00', client: 'Nadia', service: 'Manucure', status: 'pending', price: 80 },
];

const MOCK_NOTIFICATIONS = [
  { id: 'n1', text: 'Nouveau RDV reçu', time: 'Il y a 5 min', icon: 'calendar', type: 'booking' },
  { id: 'n2', text: 'Client a laissé un avis', time: 'Il y a 1h', icon: 'star', type: 'review' },
];

const QUICK_ACTIONS = [
  { id: 'slot', label: 'Ajouter\ncréneau', icon: 'plus-circle', color: COLORS.primary, bgColor: COLORS.primaryLight },
  { id: 'services', label: 'Gérer\nservices', icon: 'scissors', color: COLORS.blue, bgColor: COLORS.blueLight },
  { id: 'hours', label: 'Horaires', icon: 'clock', color: COLORS.warning, bgColor: COLORS.warningLight },
  { id: 'calendar', label: 'Voir\ncalendrier', icon: 'calendar', color: COLORS.success, bgColor: COLORS.successLight },
];

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home', screen: null },
  { id: 'bookings', label: 'Réservations', icon: 'calendar', screen: 'SalonBookings' },
  { id: 'services', label: 'Services', icon: 'scissors', screen: 'SalonServices' },
  { id: 'hours', label: 'Horaires', icon: 'clock', screen: 'SalonHours' },
  { id: 'staff', label: 'Staff', icon: 'users', screen: 'SalonOwnerStaff' },
  { id: 'clients', label: 'Clients', icon: 'user-check', screen: 'SalonClients' },
  { id: 'salon', label: 'Mon salon', icon: 'map-pin', screen: 'SalonDetails' },
  { id: 'reviews', label: 'Avis', icon: 'star', screen: 'SalonReviews' },
  { id: 'notifications', label: 'Notifications', icon: 'bell', screen: 'SalonNotifications' },
  { id: 'settings', label: 'Paramètres', icon: 'settings', screen: 'SalonSettings' },
];

// ═══════════════════════════════════════════════════════════════
// ── DRAWER MENU ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const DrawerMenu = ({ visible, onClose, salon, activeItem, onNavigate, onLogout }) => {
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.82)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  // Guard against null or invalid salon object
  if (!salon || typeof salon !== 'object' || !salon.name) {
    return null;
  }

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, friction: 10, tension: 50, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -SCREEN_WIDTH * 0.82, duration: 220, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Overlay */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View style={[styles.drawerOverlay, { opacity: overlayAnim }]} />
      </TouchableOpacity>

      {/* Drawer panel */}
      <Animated.View style={[styles.drawerPanel, { transform: [{ translateX: slideAnim }] }]}>
        {/* Drawer header */}
        <View style={styles.drawerHeader}>
          <View style={styles.drawerAvatarRow}>
            <View style={styles.drawerAvatar}>
              <Text style={styles.drawerAvatarText}>{salon.name.charAt(0)}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.drawerCloseBtn}>
              <Feather name="x" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.drawerSalonName}>{salon.name}</Text>
          <View style={styles.drawerStatusRow}>
            <View style={[styles.drawerStatusDot, salon.status === 'open' ? styles.statusOpen : styles.statusClosed]} />
            <Text style={styles.drawerStatusText}>
              {salon.status === 'open' ? 'Ouvert maintenant' : 'Fermé'}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.drawerDivider} />

        {/* Menu items */}
        <ScrollView
          style={styles.drawerItemsScroll}
          showsVerticalScrollIndicator={false}
        >
          {MENU_ITEMS.map((item, index) => {
            const isActive = item.id === activeItem;
            return (
              <Animatable.View
                key={item.id}
                animation="fadeInLeft"
                delay={50 + index * 35}
                duration={300}
                useNativeDriver
              >
                <TouchableOpacity
                  style={[styles.drawerItem, isActive && styles.drawerItemActive]}
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onNavigate(item);
                  }}
                >
                  <View style={[styles.drawerItemIcon, isActive && styles.drawerItemIconActive]}>
                    <Feather name={item.icon} size={18} color={isActive ? COLORS.primary : COLORS.textMuted} />
                  </View>
                  <Text style={[styles.drawerItemLabel, isActive && styles.drawerItemLabelActive]}>
                    {item.label}
                  </Text>
                  <Feather name="chevron-right" size={16} color={isActive ? COLORS.primary : COLORS.border} />
                </TouchableOpacity>
              </Animatable.View>
            );
          })}
        </ScrollView>

        {/* Divider */}
        <View style={styles.drawerDivider} />

        {/* Logout button */}
        <Animatable.View animation="fadeIn" delay={400} duration={300} useNativeDriver>
          <TouchableOpacity
            style={styles.drawerLogout}
            activeOpacity={0.7}
            onPress={onLogout}
          >
            <Feather name="log-out" size={18} color={COLORS.error} />
            <Text style={styles.drawerLogoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Version */}
        <Text style={styles.drawerVersion}>coifly v1.0 · MVP</Text>
      </Animated.View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// ── SKELETON COMPONENTS ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const SkeletonBox = ({ width, height, borderRadius = 8, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: COLORS.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

const DashboardSkeleton = () => (
  <View style={styles.skeletonContainer}>
    {/* Header skeleton */}
    <View style={styles.skeletonHeader}>
      <View style={{ gap: 8 }}>
        <SkeletonBox width={140} height={20} />
        <SkeletonBox width={180} height={14} />
      </View>
      <SkeletonBox width={44} height={44} borderRadius={22} />
    </View>

    {/* Stats skeleton */}
    <View style={styles.skeletonStatsRow}>
      <SkeletonBox width={(SCREEN_WIDTH - 56) / 3} height={90} borderRadius={16} />
      <SkeletonBox width={(SCREEN_WIDTH - 56) / 3} height={90} borderRadius={16} />
      <SkeletonBox width={(SCREEN_WIDTH - 56) / 3} height={90} borderRadius={16} />
    </View>

    {/* Next booking skeleton */}
    <SkeletonBox width={SCREEN_WIDTH - 40} height={140} borderRadius={16} style={{ marginTop: 20, alignSelf: 'center' }} />

    {/* Bookings skeleton */}
    {[1, 2, 3].map((i) => (
      <SkeletonBox key={i} width={SCREEN_WIDTH - 40} height={72} borderRadius={12} style={{ marginTop: 12, alignSelf: 'center' }} />
    ))}
  </View>
);

// ═══════════════════════════════════════════════════════════════
// ── STAT CARD ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const StatCard = ({ icon, label, value, suffix = '', color, bgColor, delay }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animatable.View animation="fadeInUp" delay={delay} duration={450} useNativeDriver style={{ flex: 1 }}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1 }}>
        <TouchableOpacity
          style={styles.statCard}
          activeOpacity={0.85}
          onPress={handlePress}
        >
          {/* Top accent bar */}
          <View style={[styles.statAccentBar, { backgroundColor: color }]} />

          {/* Icon badge top-right */}
          <View style={styles.statCardInner}>
            <View style={[styles.statIconBadge, { backgroundColor: bgColor }]}>
              <Feather name={icon} size={20} color={color} />
            </View>

            {/* Value */}
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
              {value}
            </Text>
            {suffix ? (
              <Text style={[styles.statSuffix, { color }]}>{suffix}</Text>
            ) : null}

            {/* Label */}
            <Text style={styles.statLabel} numberOfLines={2}>{label}</Text>
          </View>

          {/* Bottom tint */}
          <View style={[styles.statCardTint, { backgroundColor: bgColor }]} />
        </TouchableOpacity>
      </Animated.View>
    </Animatable.View>
  );
};

// ═══════════════════════════════════════════════════════════════
// ── BOOKING CARD (today list) ───────────────────────────────
// ═══════════════════════════════════════════════════════════════
const BookingRow = ({ booking, onConfirm, onCancel, delay }) => {
  const isConfirmed = booking.status === 'confirmed';
  const isPending = booking.status === 'pending';

  return (
    <Animatable.View animation="fadeInUp" delay={delay} duration={350} useNativeDriver>
      <View style={styles.bookingRow}>
        {/* Time */}
        <View style={styles.bookingTimeWrap}>
          <Text style={styles.bookingTime}>{booking.time}</Text>
        </View>

        {/* Info */}
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingClient}>{booking.client?.name || booking.client || 'Client'}</Text>
          <Text style={styles.bookingService}>{booking.service?.name || booking.service || 'Service'}</Text>
        </View>

        {/* Status / Actions */}
        {isPending ? (
          <View style={styles.bookingActions}>
            <TouchableOpacity
              style={styles.confirmMiniBtn}
              onPress={() => onConfirm(booking.id)}
              activeOpacity={0.7}
            >
              <Feather name="check" size={16} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelMiniBtn}
              onPress={() => onCancel(booking.id)}
              activeOpacity={0.7}
            >
              <Feather name="x" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.statusBadge, isConfirmed ? styles.statusConfirmed : styles.statusPending]}>
            <View style={[styles.statusDot, { backgroundColor: isConfirmed ? COLORS.success : COLORS.warning }]} />
            <Text style={[styles.statusText, { color: isConfirmed ? COLORS.success : COLORS.warning }]}>
              {isConfirmed ? 'Confirmé' : 'En attente'}
            </Text>
          </View>
        )}
      </View>
    </Animatable.View>
  );
};

// ═══════════════════════════════════════════════════════════════
// ── QUICK ACTION BUTTON ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const QuickAction = ({ action, onPress, delay }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    onPress(action.id);
  };

  return (
    <Animatable.View animation="fadeInUp" delay={delay} duration={400} useNativeDriver>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: action.bgColor }]}>
            <Feather name={action.icon} size={22} color={action.color} />
          </View>
          <Text style={styles.quickActionLabel}>{action.label}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animatable.View>
  );
};

// ═══════════════════════════════════════════════════════════════
// ── NOTIFICATION ITEM ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const NotifItem = ({ notif, delay }) => (
  <Animatable.View animation="fadeInUp" delay={delay} duration={350} useNativeDriver>
    <View style={styles.notifRow}>
      <View style={styles.notifIconWrap}>
        <Feather name={notif.icon} size={16} color={COLORS.primary} />
      </View>
      <View style={styles.notifInfo}>
        <Text style={styles.notifText}>{notif.text}</Text>
        <Text style={styles.notifTime}>{notif.time}</Text>
      </View>
      <Feather name="chevron-right" size={16} color={COLORS.border} />
    </View>
  </Animatable.View>
);

// ═══════════════════════════════════════════════════════════════
// ── EMPTY STATE ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const EmptyState = ({ onAddSlot }) => (
  <Animatable.View animation="fadeIn" duration={500} useNativeDriver>
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <Feather name="calendar" size={48} color={COLORS.border} />
      </View>
      <Text style={styles.emptyTitle}>Aucun rendez-vous aujourd'hui</Text>
      <Text style={styles.emptySubtitle}>
        Ajoutez des disponibilités pour recevoir des réservations.
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onAddSlot} activeOpacity={0.8}>
        <Feather name="plus" size={18} color={COLORS.white} />
        <Text style={styles.emptyButtonText}>Ajouter disponibilité</Text>
      </TouchableOpacity>
    </View>
  </Animatable.View>
);

// ═══════════════════════════════════════════════════════════════
// ── MAIN COMPONENT ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const SalonOwnerHomeScreen = ({ route, navigation }) => {
  const { salonId } = route?.params || {};
  const [refreshing, setRefreshing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const scrollRef = useRef(null);

  // Logs au montage
  useEffect(() => {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  📱 SALON OWNER HOME SCREEN MOUNTED                             ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('Route params:', route?.params);
    console.log('Salon ID:', salonId);
  }, [salonId]);

  // Récupérer les données via le hook personnalisé
  const {
    salonInfo,
    bookings,
    stats,
    notifications,
    nextBooking,
    loading,
    error,
    refreshAll,
    handleConfirmBooking: onConfirmBooking,
    handleCancelBooking: onCancelBooking,
  } = useSalonOwnerData(salonId);

  // Afficher une erreur si salonId est manquant
  useEffect(() => {
    if (!salonId) {
      Alert.alert(
        'Erreur',
        'ID du salon manquant. Veuillez réessayer.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [salonId, navigation]);

  // Logs pour le statut du loading
  useEffect(() => {
    if (loading) {
      console.log('⏳ [SalonOwnerHomeScreen] Chargement en cours...');
    } else {
      console.log('✅ [SalonOwnerHomeScreen] Chargement terminé');
      console.log('   Données disponibles:', {
        salonInfo: !!salonInfo,
        bookings: bookings?.length || 0,
        stats: !!stats,
        notifications: notifications?.length || 0,
      });
    }
  }, [loading, salonInfo, bookings, stats, notifications]);

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    console.log('\n🔄 [SalonOwnerHomeScreen] Pull-to-refresh activé');
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await refreshAll();
      console.log('✅ [SalonOwnerHomeScreen] Refresh terminé avec succès');
    } catch (err) {
      console.error('❌ [SalonOwnerHomeScreen] Erreur refresh:', err);
    } finally {
      setRefreshing(false);
    }
  }, [refreshAll]);

  // ── Handlers ────────────────────────────────────────────
  const handleConfirm = useCallback(
    (bookingId) => {
      console.log('👆 [SalonOwnerHomeScreen] Confirmer réservation #' + bookingId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onConfirmBooking(bookingId).then((success) => {
        if (success) {
          console.log('✅ [SalonOwnerHomeScreen] Confirmation réussie');
          Alert.alert('Succès', 'Réservation confirmée!');
        } else {
          console.log('❌ [SalonOwnerHomeScreen] Échec de la confirmation');
        }
      });
    },
    [onConfirmBooking]
  );

  const handleCancel = useCallback(
    (bookingId) => {
      console.log('👆 [SalonOwnerHomeScreen] Annuler réservation #' + bookingId);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert(
        'Annuler le RDV',
        'Voulez-vous vraiment annuler ce rendez-vous ?',
        [
          { text: 'Non', style: 'cancel' },
          {
            text: 'Oui, annuler',
            style: 'destructive',
            onPress: async () => {
              const success = await onCancelBooking(bookingId);
              if (success) {
                console.log('✅ [SalonOwnerHomeScreen] Annulation réussie');
                Alert.alert('Succès', 'Réservation annulée.');
              } else {
                console.log('❌ [SalonOwnerHomeScreen] Échec de l\'annulation');
              }
            },
          },
        ]
      );
    },
    [onCancelBooking]
  );

  // ── Drawer handlers ─────────────────────────────────────
  const handleOpenDrawer = () => {
    console.log('👆 [SalonOwnerHomeScreen] Ouverture du drawer');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    console.log('👆 [SalonOwnerHomeScreen] Fermeture du drawer');
    setDrawerOpen(false);
  };

  const handleDrawerNavigate = (item) => {
    console.log('👆 [SalonOwnerHomeScreen] Navigation menu:', item.label, '→', item.screen);
    setDrawerOpen(false);
    if (item.id === 'dashboard') return; // already on dashboard
    if (item.screen) {
      setTimeout(() => navigation.navigate(item.screen, { salonId }), 250);
    } else {
      setTimeout(() => {
        Alert.alert(item.label, 'Fonctionnalité à venir dans la prochaine version.');
      }, 250);
    }
  };

  const handleLogout = () => {
    console.log('👆 [SalonOwnerHomeScreen] Tentative de déconnexion');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDrawerOpen(false);
    setTimeout(() => {
      Alert.alert(
        'Se déconnecter',
        'Voulez-vous vraiment vous déconnecter ?',
        [
          { text: 'Non', style: 'cancel' },
          { 
            text: 'Oui', 
            style: 'destructive', 
            onPress: async () => {
              console.log('👆 [SalonOwnerHomeScreen] Déconnexion confirmée');
              const logout = useAuthStore.getState().logout;
              await logout();
              setTimeout(() => {
                navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
              }, 500);
            } 
          },
        ]
      );
    }, 250);
  };

  const handleConfirmNext = () => {
    if (nextBooking?.id) {
      console.log('👆 [SalonOwnerHomeScreen] Confirmer prochain RDV #' + nextBooking.id);
      handleConfirm(nextBooking.id);
    }
  };

  const handleCancelNext = () => {
    if (nextBooking?.id) {
      console.log('👆 [SalonOwnerHomeScreen] Annuler prochain RDV #' + nextBooking.id);
      handleCancel(nextBooking.id);
    }
  };

  const handleQuickAction = (actionId) => {
    console.log('👆 [SalonOwnerHomeScreen] Action rapide:', actionId);
    switch (actionId) {
      case 'slot':
        Alert.alert('Ajouter créneau', 'Fonctionnalité à venir dans la prochaine version.');
        break;
      case 'services':
        console.log('   → Navigation vers SalonServices');
        navigation.navigate('SalonServices', { salonId });
        break;
      case 'hours':
        console.log('   → Navigation vers SalonHours');
        navigation.navigate('SalonHours', { salonId });
        break;
      case 'calendar':
        Alert.alert('Calendrier', 'Fonctionnalité à venir dans la prochaine version.');
        break;
    }
  };

  const handleNotificationPress = () => {
    console.log('👆 [SalonOwnerHomeScreen] Ouvrir notifications');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('SalonNotifications');
  };

  // Afficher une erreur si applicable
  useEffect(() => {
    if (error) {
      console.error('❌ [SalonOwnerHomeScreen] Erreur globale:', error);
    }
  }, [error]);

  // ── Données pour affichage ───────────────────────────
  const displaySalon = salonInfo || MOCK_SALON;
  const displayBookings = bookings || [];
  const displayStats = stats || MOCK_STATS;
  const displayNotifications = notifications || [];
  const nextPendingBooking = nextBooking || bookings?.find((b) => b.status === 'pending') || bookings?.[0];
  const showEmpty = displayBookings.length === 0;

  // Ensure stat values are numbers (defensive against unexpected object values)
  const statTodayBookings = typeof displayStats?.total_bookings_today === 'number' ? displayStats.total_bookings_today : (displayStats?.todayBookings || 0);
  const statRevenue = typeof displayStats?.total_revenue === 'number' ? displayStats.total_revenue : (displayStats?.todayRevenue || 0);
  const statPending = typeof displayStats?.pending_bookings === 'number' ? displayStats.pending_bookings : (displayStats?.pendingCount || 0);

  // Logs d'affichage
  useEffect(() => {
    console.log('\n📊 [SalonOwnerHomeScreen] État de l\'écran:');
    console.log('   Loading:', loading);
    console.log('   Salon:', displaySalon?.name || '?');
    console.log('   Réservations:', displayBookings?.length || 0);
    console.log('   Revenus:', statRevenue);
    console.log('   En attente:', statPending);
    console.log('');
  }, [loading, displaySalon, displayBookings, statRevenue, statPending]);

  // ═══════════════════════════════════════════════════════════
  // ── RENDER ────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <DashboardSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* ── HEADER ──────────────────────────────────────── */}
      <Animatable.View animation="fadeInDown" duration={400} useNativeDriver>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Hamburger menu button */}
            <TouchableOpacity
              style={styles.hamburgerBtn}
              onPress={handleOpenDrawer}
              activeOpacity={0.7}
            >
              <Feather name="menu" size={22} color={COLORS.text} />
            </TouchableOpacity>
            {/* Salon avatar */}
            <View style={styles.salonAvatar}>
              <Text style={styles.salonAvatarText}>
                {displaySalon?.name?.charAt(0) || 'S'}
              </Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.salonName}>{displaySalon?.name || 'Mon Salon'}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusIndicator, displaySalon?.status === 'open' ? styles.statusOpen : styles.statusClosed]} />
                <Text style={styles.statusLabel}>
                  {displaySalon?.status === 'open'
                    ? `Ouvert · ${displaySalon?.openTime || '09:00'} – ${displaySalon?.closeTime || '19:00'}`
                    : 'Fermé'}
                </Text>
              </View>
            </View>
          </View>

          {/* Notification bell */}
          <TouchableOpacity
            style={styles.notifButton}
            onPress={handleNotificationPress}
            activeOpacity={0.7}
          >
            <Feather name="bell" size={22} color={COLORS.text} />
            {statPending > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{statPending}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Animatable.View>

      {/* ── BODY ────────────────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* ── STAT CARDS ──────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatCard
            icon="calendar"
            label="RDV aujourd'hui"
            value={statTodayBookings}
            color={COLORS.primary}
            bgColor={COLORS.primaryLight}
            delay={100}
          />
          <StatCard
            icon="trending-up"
            label="Revenus"
            value={statRevenue}
            suffix="MAD"
            color={COLORS.success}
            bgColor={COLORS.successLight}
            delay={200}
          />
          <StatCard
            icon="clock"
            label="En attente"
            value={statPending}
            color={COLORS.warning}
            bgColor={COLORS.warningLight}
            delay={300}
          />
        </View>

        {showEmpty ? (
          <EmptyState onAddSlot={() => handleQuickAction('slot')} />
        ) : (
          <>
            {/* ── PROCHAIN RDV ──────────────────────────── */}
            {nextPendingBooking && (
              <Animatable.View animation="fadeInUp" delay={350} duration={400} useNativeDriver>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Prochain rendez-vous</Text>
                </View>

                <View style={styles.nextBookingCard}>
                  {/* Time badge */}
                  <View style={styles.nextBookingTop}>
                    <View style={styles.nextTimeBadge}>
                      <Feather name="clock" size={14} color={COLORS.primary} />
                      <Text style={styles.nextTimeText}>{nextPendingBooking?.time || '10:00'}</Text>
                    </View>
                    <Text style={styles.nextPrice}>{nextPendingBooking?.service?.price || nextPendingBooking?.price || 100} MAD</Text>
                  </View>

                  {/* Client info */}
                  <View style={styles.nextClientRow}>
                    <View style={styles.nextClientAvatar}>
                      <Text style={styles.nextClientAvatarText}>
                        {(nextPendingBooking?.client?.name || 'C').charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.nextClientInfo}>
                      <Text style={styles.nextClientName}>{nextPendingBooking?.client?.name || 'Client'}</Text>
                      <Text style={styles.nextServiceName}>{nextPendingBooking?.service?.name || 'Service'}</Text>
                    </View>
                  </View>

                  {/* Action buttons */}
                  <View style={styles.nextActions}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={handleCancelNext}
                      activeOpacity={0.7}
                    >
                      <Feather name="x" size={18} color={COLORS.error} />
                      <Text style={styles.cancelBtnText}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.confirmBtn}
                      onPress={handleConfirmNext}
                      activeOpacity={0.7}
                    >
                      <Feather name="check" size={18} color={COLORS.white} />
                      <Text style={styles.confirmBtnText}>Confirmer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animatable.View>
            )}

            {/* ── RDV DU JOUR ──────────────────────────── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Rendez-vous du jour</Text>
              <Text style={styles.sectionCount}>{displayBookings.length} RDV</Text>
            </View>

            <View style={styles.bookingsList}>
              {displayBookings.map((booking, index) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  onConfirm={handleConfirm}
                  onCancel={handleCancel}
                  delay={400 + index * 60}
                />
              ))}
            </View>
          </>
        )}

        {/* ── ACTIONS RAPIDES ──────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
        </View>

        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action, index) => (
            <QuickAction
              key={action.id}
              action={action}
              onPress={handleQuickAction}
              delay={500 + index * 60}
            />
          ))}
        </View>

        {/* ── NOTIFICATIONS ────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <TouchableOpacity onPress={handleNotificationPress} activeOpacity={0.6}>
            <Text style={styles.seeAllLink}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notifsCard}>
          {displayNotifications.map((notif, index) => (
            <NotifItem key={notif.id} notif={notif} delay={600 + index * 60} />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── DRAWER MENU ─────────────────────────────────── */}
      <DrawerMenu
        visible={drawerOpen}
        onClose={handleCloseDrawer}
        salon={displaySalon}
        activeItem="dashboard"
        onNavigate={handleDrawerNavigate}
        onLogout={handleLogout}
      />
    </View>
  );
  
  // Logs pour indiquer que le rendu s'affiche
  console.log('✨ [SalonOwnerHomeScreen] RENDU COMPLET - Page affichée');
};

// ═══════════════════════════════════════════════════════════════
// ── STYLES ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  // ── Container ──────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Header ─────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  salonAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  salonAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerInfo: {
    gap: 3,
  },
  salonName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIndicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusOpen: {
    backgroundColor: COLORS.success,
  },
  statusClosed: {
    backgroundColor: COLORS.error,
  },
  statusLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  notifBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ── Body ───────────────────────────────────────────
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // ── Stats ──────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statAccentBar: {
    height: 4,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  statCardInner: {
    padding: 14,
    paddingTop: 12,
    alignItems: 'flex-start',
  },
  statIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statCardTint: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.12,
    transform: [{ translateX: 20 }, { translateY: 20 }],
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.8,
    lineHeight: 28,
  },
  statSuffix: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 15,
  },

  // ── Section Headers ────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // ── Next Booking Card ──────────────────────────────
  nextBookingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nextBookingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nextTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  nextTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  nextPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  nextClientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  nextClientAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextClientAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  nextClientInfo: {
    gap: 2,
  },
  nextClientName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  nextServiceName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  nextActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: '#F5C6CB',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
  confirmBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.success,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ── Bookings List ──────────────────────────────────
  bookingsList: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  bookingTimeWrap: {
    width: 70,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 12,
  },
  bookingTime: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  bookingInfo: {
    flex: 1,
    gap: 2,
  },
  bookingClient: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  bookingService: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 6,
  },
  confirmMiniBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelMiniBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusConfirmed: {
    backgroundColor: COLORS.successLight,
  },
  statusPending: {
    backgroundColor: COLORS.warningLight,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Quick Actions ──────────────────────────────────
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  quickActionBtn: {
    width: (SCREEN_WIDTH - 50) / 2,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 17,
  },

  // ── Notifications ──────────────────────────────────
  notifsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  notifIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifInfo: {
    flex: 1,
    gap: 2,
  },
  notifText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  notifTime: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
  },

  // ── Empty State ────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ── Skeleton ───────────────────────────────────────
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 54,
    backgroundColor: COLORS.background,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  skeletonStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  // ── Drawer ─────────────────────────────────────────
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  drawerPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH * 0.82,
    height: '100%',
    backgroundColor: COLORS.card,
    paddingTop: 54,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  drawerHeader: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  drawerAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  drawerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerAvatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
  },
  drawerCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerSalonName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  drawerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  drawerStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  drawerStatusText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 24,
  },
  drawerItemsScroll: {
    flex: 1,
    paddingTop: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 24,
    marginVertical: 1,
  },
  drawerItemActive: {
    backgroundColor: COLORS.primaryLight,
    marginHorizontal: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  drawerItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  drawerItemIconActive: {
    backgroundColor: '#FFE0E0',
  },
  drawerItemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  drawerItemLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  drawerLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  drawerLogoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
  drawerVersion: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.border,
    textAlign: 'center',
    paddingBottom: 24,
    paddingTop: 8,
  },
});

export default SalonOwnerHomeScreen;
