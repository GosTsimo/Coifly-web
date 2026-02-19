import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  RefreshControl,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';
import { useAuthStore } from '../../store/authStore';
import barberHomeService from '../../services/barberHomeService';

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
const MOCK_BARBER = {
  name: 'Ahmed',
  salon: 'Barber Luxe',
  photo: null,
  status: 'available',
};

const MOCK_STATS = {
  today_clients: 5,
  today_revenue: 700,
  pending: 2,
};

const MOCK_NEXT = {
  time: '10:00',
  client: 'Yassine',
  service: 'Dégradé',
  price: 120,
};

const MOCK_BOOKINGS = [
  { id: 'b1', time: '10:00', client: 'Yassine', service: 'Dégradé', status: 'confirmed', price: 120 },
  { id: 'b2', time: '11:00', client: 'Karim', service: 'Barbe', status: 'pending', price: 80 },
  { id: 'b3', time: '13:00', client: 'Hamza', service: 'Coupe', status: 'confirmed', price: 100 },
  { id: 'b4', time: '15:00', client: 'Mehdi', service: 'Fade', status: 'pending', price: 150 },
];

const MOCK_NOTIFICATIONS = [
  { id: 'n1', text: 'Nouveau RDV reçu', time: 'Il y a 5 min', icon: 'calendar' },
  { id: 'n2', text: 'Avis client reçu', time: 'Il y a 1h', icon: 'star' },
];

const QUICK_ACTIONS = [
  { id: 'planning', label: 'Voir\nplanning', icon: 'calendar', color: COLORS.primary, bgColor: COLORS.surfaceLight },
  { id: 'services', label: 'Mes\nservices', icon: 'scissors', color: COLORS.info, bgColor: COLORS.infoLight },
  { id: 'hours', label: 'Mes\nhoraires', icon: 'clock', color: COLORS.warning, bgColor: COLORS.warningLight },
  { id: 'clients', label: 'Mes\nclients', icon: 'users', color: COLORS.success, bgColor: COLORS.successLight },
];

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home', screen: null },
  { id: 'planning', label: 'Planning', icon: 'calendar', screen: 'BarberPlanning' },
  { id: 'bookings', label: 'Réservations', icon: 'book', screen: 'BarberBookings' },
  { id: 'services', label: 'Mes services', icon: 'scissors', screen: 'BarberServices' },
  { id: 'hours', label: 'Mes horaires', icon: 'clock', screen: 'BarberHours' },
  { id: 'clients', label: 'Clients', icon: 'users', screen: 'BarberClients' },
  { id: 'reviews', label: 'Avis', icon: 'star', screen: 'BarberReviews' },
  { id: 'notifications', label: 'Notifications', icon: 'bell', screen: 'BarberNotifications' },
  { id: 'settings', label: 'Paramètres', icon: 'settings', screen: 'BarberSettings' },
];

// ═══════════════════════════════════════════════════════════════
// ── DRAWER MENU ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const DrawerMenu = ({ visible, onClose, barber, activeItem, onNavigate, onLogout }) => {
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.82)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

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
              <Text style={styles.drawerAvatarText}>{barber.name.charAt(0)}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.drawerCloseBtn}>
              <Feather name="x" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.drawerBarberName}>{barber.name}</Text>
          <Text style={styles.drawerSalonName}>{barber.salon}</Text>
          <View style={styles.drawerStatusRow}>
            <View style={[styles.drawerStatusDot, barber.status === 'available' ? styles.statusOpen : styles.statusClosed]} />
            <Text style={styles.drawerStatusText}>
              {barber.status === 'available' ? 'Disponible aujourd\'hui' : 'Indisponible'}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.drawerDivider} />

        {/* Menu items */}
        <ScrollView style={styles.drawerItemsScroll} showsVerticalScrollIndicator={false}>
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

        {/* Logout */}
        <Animatable.View animation="fadeIn" delay={400} duration={300} useNativeDriver>
          <TouchableOpacity style={styles.drawerLogout} activeOpacity={0.7} onPress={onLogout}>
            <Feather name="log-out" size={18} color={COLORS.error} />
            <Text style={styles.drawerLogoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </Animatable.View>

        <Text style={styles.drawerVersion}>coifly v1.0 · Barber</Text>
      </Animated.View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// ── SKELETON ────────────────────────────────────────────────
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
      style={[{ width, height, borderRadius, backgroundColor: COLORS.border, opacity }, style]}
    />
  );
};

const DashboardSkeleton = () => (
  <View style={styles.skeletonContainer}>
    <View style={styles.skeletonHeader}>
      <View style={{ gap: 8 }}>
        <SkeletonBox width={140} height={20} />
        <SkeletonBox width={180} height={14} />
      </View>
      <SkeletonBox width={44} height={44} borderRadius={22} />
    </View>
    <View style={styles.skeletonStatsRow}>
      <SkeletonBox width={(SCREEN_WIDTH - 56) / 3} height={90} borderRadius={16} />
      <SkeletonBox width={(SCREEN_WIDTH - 56) / 3} height={90} borderRadius={16} />
      <SkeletonBox width={(SCREEN_WIDTH - 56) / 3} height={90} borderRadius={16} />
    </View>
    <SkeletonBox width={SCREEN_WIDTH - 40} height={150} borderRadius={16} style={{ marginTop: 24, alignSelf: 'center' }} />
    {[1, 2, 3].map((i) => (
      <SkeletonBox key={i} width={SCREEN_WIDTH - 40} height={72} borderRadius={12} style={{ marginTop: 12, alignSelf: 'center' }} />
    ))}
  </View>
);

// ═══════════════════════════════════════════════════════════════
// ── STAT CARD ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const StatCard = ({ icon, label, value, suffix = '', color, bgColor, delay }) => (
  <Animatable.View animation="fadeInUp" delay={delay} duration={400} useNativeDriver>
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconWrap, { backgroundColor: bgColor }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>
        {value}
        {suffix ? <Text style={styles.statSuffix}> {suffix}</Text> : null}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </Animatable.View>
);

// ═══════════════════════════════════════════════════════════════
// ── BOOKING ROW ─────────────────────────────────────────────
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
          <Text style={styles.bookingClient}>{booking.client}</Text>
          <Text style={styles.bookingService}>{booking.service}</Text>
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
          <View style={[styles.statusBadge, isConfirmed ? styles.statusConfirmed : styles.statusPendingBadge]}>
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
// ── QUICK ACTION ────────────────────────────────────────────
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
        <TouchableOpacity style={styles.quickActionBtn} onPress={handlePress} activeOpacity={0.8}>
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
const NotifItem = ({ notif, delay, onPress }) => (
  <Animatable.View animation="fadeInUp" delay={delay} duration={350} useNativeDriver>
    <TouchableOpacity style={styles.notifRow} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.notifIconWrap}>
        <Feather name={notif.icon} size={16} color={COLORS.primary} />
      </View>
      <View style={styles.notifInfo}>
        <Text style={styles.notifText}>{notif.text}</Text>
        <Text style={styles.notifTime}>{notif.time}</Text>
      </View>
      <Feather name="chevron-right" size={16} color={COLORS.border} />
    </TouchableOpacity>
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
      <Text style={styles.emptyTitle}>Aucun client aujourd'hui</Text>
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
export default function BarberHomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [stats, setStats] = useState(MOCK_STATS);
  const [barber, setBarber] = useState(MOCK_BARBER);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [showEmpty, setShowEmpty] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [barberId, setBarberId] = useState(null);
  const [error, setError] = useState(null);

  // Récupérer la fonction logout du store
  const logout = useAuthStore((state) => state.logout);

  const scrollRef = useRef(null);

  // Charger les données du tableau de bord au montage
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Fonction pour charger toutes les données du dashboard
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📋 [BarberHomeScreen] Début du chargement des données du dashboard');

      // 1️⃣ Récupérer le barber ID depuis AsyncStorage
      const bid = await barberHomeService.getBarberIdFromStorage();
      if (!bid) {
        console.error('❌ [BarberHomeScreen] Impossible de récupérer barber_id');
        setError('Impossible de récupérer vos données');
        setLoading(false);
        return;
      }
      setBarberId(bid);
      console.log('✅ [BarberHomeScreen] Barber ID récupéré:', bid);

      // 2️⃣ Charger les données du dashboard (barber info + stats + next booking)
      const dashboardRes = await barberHomeService.getDashboardData(bid);
      if (dashboardRes.success) {
        const dashData = dashboardRes.data;
        console.log('✅ [BarberHomeScreen] Dashboard data chargé avec succès');

        // Mettre à jour les infos du coiffeur
        if (dashData.barber) {
          setBarber({
            name: dashData.barber.name,
            salon: dashData.barber.salon_name,
            photo: null,
            status: dashData.barber.status || 'available',
          });
        }

        // Mettre à jour les statistiques
        if (dashData.stats) {
          setStats({
            today_clients: dashData.stats.today_clients || 0,
            today_revenue: dashData.stats.today_revenue || 0,
            pending: dashData.stats.pending_count || 0,
          });
        }
      } else {
        console.error('❌ [BarberHomeScreen] Erreur dashboard:', dashboardRes.error);
      }

      // 3️⃣ Charger les RDV du jour
      const bookingsRes = await barberHomeService.getBarberBookings(bid);
      console.log('📋 [BarberHomeScreen] Réponse getBarberBookings:', {
        success: bookingsRes.success,
        hasData: !!bookingsRes.data,
        dataStructure: bookingsRes.data ? Object.keys(bookingsRes.data) : null,
        bookingsCount: bookingsRes.data?.bookings?.length || 0,
        fullResponse: bookingsRes.data,
        error: bookingsRes.error,
      });

      if (bookingsRes.success && bookingsRes.data && Array.isArray(bookingsRes.data.bookings)) {
        const formattedBookings = bookingsRes.data.bookings.map(b => ({
          id: b.id,
          time: b.time,
          client: b.client_name,
          service: b.service_name,
          status: b.status,
          price: b.price,
        }));
        setBookings(formattedBookings);
        console.log('✅ [BarberHomeScreen] RDV chargés:', formattedBookings.length, 'RDV');

        // Mettre à jour showEmpty selon s'il y a des RDV
        setShowEmpty(formattedBookings.length === 0);
      } else {
        console.error('❌ [BarberHomeScreen] Erreur bookings - success:', bookingsRes.success, '- error:', bookingsRes.error);
        setBookings([]);
        setShowEmpty(true);
      }

      // 4️⃣ Charger les notifications
      const notifRes = await barberHomeService.getBarberNotifications(bid, { limit: 5 });
      console.log('📋 [BarberHomeScreen] Réponse getBarberNotifications:', {
        success: notifRes.success,
        hasData: !!notifRes.data,
        dataStructure: notifRes.data ? Object.keys(notifRes.data) : null,
        notificationsCount: notifRes.data?.notifications?.length || 0,
        unreadCount: notifRes.data?.unread_count,
        fullResponse: notifRes.data,
        error: notifRes.error,
      });

      if (notifRes.success && notifRes.data && Array.isArray(notifRes.data.notifications)) {
        const formattedNotifs = notifRes.data.notifications.map(n => ({
          id: n.id,
          text: n.title || n.message,
          time: n.created_at || 'Il y a peu',
          icon: n.type === 'booking' ? 'calendar' : n.type === 'review' ? 'star' : 'bell',
        }));
        setNotifications(formattedNotifs);
        console.log('✅ [BarberHomeScreen] Notifications chargées:', formattedNotifs.length, 'notifications');
      } else {
        console.error('❌ [BarberHomeScreen] Erreur notifications - success:', notifRes.success, '- error:', notifRes.error);
        setNotifications([]);
      }

      setLoading(false);
    } catch (err) {
      console.error('❌ [BarberHomeScreen] Erreur globale chargement:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Pull-to-refresh avec rechargement des données
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadDashboardData().then(() => {
      setRefreshing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  }, [loadDashboardData]);

  // ── Handlers ────────────────────────────────────────────
  const handleConfirm = useCallback((bookingId) => {
    if (!barberId) {
      Alert.alert('Erreur', 'ID coiffeur manquant');
      return;
    }

    Alert.alert(
      'Confirmer le RDV',
      'Confirmer ce rendez-vous ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              console.log('📤 [BarberHomeScreen] Confirmation RDV:', { barberId, bookingId });

              const res = await barberHomeService.confirmBooking(barberId, bookingId);

              if (res.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setBookings((prev) =>
                  prev.map((b) => (b.id === bookingId ? { ...b, status: 'confirmed' } : b))
                );
                setStats((prev) => ({
                  ...prev,
                  pending: Math.max(0, prev.pending - 1),
                }));
                console.log('✅ [BarberHomeScreen] RDV confirmé avec succès');
                Alert.alert('Succès', 'Rendez-vous confirmé!');
              } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                console.error('❌ [BarberHomeScreen] Erreur confirmation:', res.error);
                Alert.alert('Erreur', res.error || 'Impossible de confirmer le RDV');
              }
            } catch (err) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              console.error('❌ [BarberHomeScreen] Erreur exception confirmation:', err);
              Alert.alert('Erreur', err.message);
            }
          },
        },
      ]
    );
  }, [barberId]);

  const handleCancel = useCallback((bookingId) => {
    if (!barberId) {
      Alert.alert('Erreur', 'ID coiffeur manquant');
      return;
    }

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
            try {
              console.log('📤 [BarberHomeScreen] Annulation RDV:', { barberId, bookingId });

              const res = await barberHomeService.cancelBooking(barberId, bookingId);

              if (res.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setBookings((prev) => prev.filter((b) => b.id !== bookingId));
                setStats((prev) => ({
                  ...prev,
                  today_clients: Math.max(0, prev.today_clients - 1),
                  pending: Math.max(0, prev.pending - 1),
                }));
                console.log('✅ [BarberHomeScreen] RDV annulé avec succès');
                Alert.alert('Annulation', 'Rendez-vous annulé.');
              } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                console.error('❌ [BarberHomeScreen] Erreur annulation:', res.error);
                Alert.alert('Erreur', res.error || 'Impossible d\'annuler le RDV');
              }
            } catch (err) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              console.error('❌ [BarberHomeScreen] Erreur exception annulation:', err);
              Alert.alert('Erreur', err.message);
            }
          },
        },
      ]
    );
  }, [barberId]);

  const handleConfirmNext = useCallback(() => {
    if (nextBooking) {
      handleConfirm(nextBooking.id);
    }
  }, [nextBooking, handleConfirm]);

  const handleCancelNext = useCallback(() => {
    if (nextBooking) {
      handleCancel(nextBooking.id);
    }
  }, [nextBooking, handleCancel]);

  const handleQuickAction = useCallback(
    (actionId) => {
      switch (actionId) {
        case 'planning':
          navigation.navigate('BarberPlanning');
          break;
        case 'services':
          navigation.navigate('BarberServices');
          break;
        case 'hours':
          navigation.navigate('BarberHours');
          break;
        case 'clients':
          navigation.navigate('BarberClients');
          break;
        default:
          break;
      }
    },
    [navigation]
  );

  const handleNotificationPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('BarberNotifications');
  }, [navigation]);

  // ── Drawer handlers ─────────────────────────────────────
  const handleOpenDrawer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleDrawerNavigate = useCallback(
    (item) => {
      setDrawerOpen(false);
      if (item.id === 'dashboard') return;
      if (item.screen) {
        setTimeout(() => navigation.navigate(item.screen), 250);
      } else {
        setTimeout(() => {
          Alert.alert(item.label, 'Fonctionnalité à venir dans la prochaine version.');
        }, 250);
      }
    },
    [navigation]
  );

  const handleLogout = useCallback(() => {
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
              try {
                await logout();
                setTimeout(() => {
                  navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
                }, 500);
              } catch (error) {
                Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
              }
            },
          },
        ]
      );
    }, 250);
  }, [navigation, logout]);

  // First pending booking for "Next" section
  const nextBooking = bookings[0];

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
            {/* Hamburger */}
            <TouchableOpacity
              style={styles.hamburgerBtn}
              onPress={handleOpenDrawer}
              activeOpacity={0.7}
            >
              <Feather name="menu" size={22} color={COLORS.text} />
            </TouchableOpacity>

            {/* Barber avatar */}
            <View style={styles.barberAvatar}>
              <Text style={styles.barberAvatarText}>{barber.name.charAt(0)}</Text>
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.barberName}>{barber.name}</Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusIndicator,
                    barber.status === 'available' ? styles.statusOpen : styles.statusClosed,
                  ]}
                />
                <Text style={styles.statusLabel}>
                  {barber.status === 'available' ? 'Disponible aujourd\'hui' : 'Indisponible'}
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
            {stats.pending > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{stats.pending}</Text>
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* ── STAT CARDS ──────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatCard
            icon="users"
            label="Clients"
            value={stats.today_clients}
            color={COLORS.primary}
            bgColor={COLORS.surfaceLight}
            delay={100}
          />
          <StatCard
            icon="trending-up"
            label="Revenus"
            value={stats.today_revenue}
            suffix="MAD"
            color={COLORS.success}
            bgColor={COLORS.successLight}
            delay={200}
          />
          <StatCard
            icon="clock"
            label="En attente"
            value={stats.pending}
            color={COLORS.warning}
            bgColor={COLORS.warningLight}
            delay={300}
          />
        </View>

        {showEmpty ? (
          <EmptyState
            onAddSlot={() =>
              Alert.alert('Disponibilité', 'Fonctionnalité à venir dans la prochaine version.')
            }
          />
        ) : (
          <>
            {/* ── PROCHAIN RDV ──────────────────────────── */}
            {nextBooking && (
              <Animatable.View animation="fadeInUp" delay={350} duration={400} useNativeDriver>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Prochain rendez-vous</Text>
                </View>

                <View style={styles.nextBookingCard}>
                  {/* Top row */}
                  <View style={styles.nextBookingTop}>
                    <View style={styles.nextTimeBadge}>
                      <Feather name="clock" size={14} color={COLORS.primary} />
                      <Text style={styles.nextTimeText}>{nextBooking.time}</Text>
                    </View>
                    <Text style={styles.nextPrice}>{nextBooking.price} MAD</Text>
                  </View>

                  {/* Client info */}
                  <View style={styles.nextClientRow}>
                    <View style={styles.nextClientAvatar}>
                      <Text style={styles.nextClientAvatarText}>
                        {nextBooking.client.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.nextClientInfo}>
                      <Text style={styles.nextClientName}>{nextBooking.client}</Text>
                      <Text style={styles.nextServiceName}>{nextBooking.service}</Text>
                    </View>
                  </View>

                  {/* Action buttons */}
                  <View style={styles.nextActions}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={handleCancelNext}
                      activeOpacity={0.7}
                    >
                      <Feather name="x" size={16} color={COLORS.error} />
                      <Text style={styles.cancelBtnText}>Annuler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.detailBtn}
                      onPress={() => navigation.navigate('BarberBookings')}
                      activeOpacity={0.7}
                    >
                      <Feather name="eye" size={16} color={COLORS.primary} />
                      <Text style={styles.detailBtnText}>Détail</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.confirmBtn}
                      onPress={handleConfirmNext}
                      activeOpacity={0.7}
                    >
                      <Feather name="check" size={16} color={COLORS.white} />
                      <Text style={styles.confirmBtnText}>Confirmer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animatable.View>
            )}

            {/* ── RDV DU JOUR ───────────────────────────── */}
            <Animatable.View animation="fadeInUp" delay={450} duration={400} useNativeDriver>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Rendez-vous du jour</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('BarberBookings')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionLink}>Voir tout</Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>

            {bookings.map((booking, index) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                delay={500 + index * 80}
              />
            ))}

            {/* ── ACTIONS RAPIDES ────────────────────────── */}
            <Animatable.View animation="fadeInUp" delay={700} duration={400} useNativeDriver>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Actions rapides</Text>
              </View>
            </Animatable.View>

            <View style={styles.quickActionsGrid}>
              {QUICK_ACTIONS.map((action, index) => (
                <QuickAction
                  key={action.id}
                  action={action}
                  onPress={handleQuickAction}
                  delay={750 + index * 60}
                />
              ))}
            </View>

            {/* ── NOTIFICATIONS RAPIDES ──────────────────── */}
            <Animatable.View animation="fadeInUp" delay={950} duration={400} useNativeDriver>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Activité récente</Text>
                <TouchableOpacity
                  onPress={handleNotificationPress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionLink}>Tout voir</Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>

            {notifications.map((notif, index) => (
              <NotifItem
                key={notif.id}
                notif={notif}
                delay={1000 + index * 80}
                onPress={handleNotificationPress}
              />
            ))}

            {/* Bottom spacer */}
            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>

      {/* ── DRAWER ──────────────────────────────────────── */}
      <DrawerMenu
        visible={drawerOpen}
        onClose={handleCloseDrawer}
        barber={barber}
        activeItem="dashboard"
        onNavigate={handleDrawerNavigate}
        onLogout={handleLogout}
      />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// ── STYLES ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  // ── Container ──────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  // ── Header ─────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  barberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  barberAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerInfo: {
    flex: 1,
  },
  barberName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  statusIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  statusOpen: {
    backgroundColor: COLORS.success,
  },
  statusClosed: {
    backgroundColor: COLORS.textMuted,
  },
  statusLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  notifBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ── Body ───────────────────────────────────────────────
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // ── Stats ──────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 25,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  statSuffix: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 3,
    fontWeight: '500',
  },

  // ── Section Header ─────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // ── Next Booking Card ──────────────────────────────────
  nextBookingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  nextBookingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  nextTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceLight,
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
    fontWeight: '700',
    color: COLORS.text,
  },
  nextClientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  nextClientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nextClientAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  nextClientInfo: {
    flex: 1,
  },
  nextClientName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  nextServiceName: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  nextActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.errorLight,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.error,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
  },
  detailBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.success,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },

  // ── Booking Row ────────────────────────────────────────
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  bookingTimeWrap: {
    width: 52,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
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
  },
  bookingClient: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  bookingService: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelMiniBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusConfirmed: {
    backgroundColor: COLORS.successLight,
  },
  statusPendingBadge: {
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

  // ── Quick Actions ──────────────────────────────────────
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickActionBtn: {
    width: (SCREEN_WIDTH - 70) / 4,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 15,
  },

  // ── Notifications ──────────────────────────────────────
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  notifIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifInfo: {
    flex: 1,
  },
  notifText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  notifTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // ── Empty State ────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
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

  // ── Skeleton ───────────────────────────────────────────
  skeletonContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  skeletonStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },

  // ── Drawer ─────────────────────────────────────────────
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawerPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH * 0.82,
    backgroundColor: COLORS.card,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  drawerHeader: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  drawerAvatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  drawerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerAvatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  drawerCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerBarberName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  drawerSalonName: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  drawerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  drawerStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  drawerStatusText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceLight,
    marginHorizontal: 24,
  },
  drawerItemsScroll: {
    flex: 1,
    paddingVertical: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 12,
    borderRadius: 12,
  },
  drawerItemActive: {
    backgroundColor: COLORS.surfaceLight,
  },
  drawerItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  drawerItemIconActive: {
    backgroundColor: 'rgba(224,110,110,0.15)',
  },
  drawerItemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  drawerItemLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  drawerLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 36,
    marginTop: 8,
  },
  drawerLogoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
  },
  drawerVersion: {
    fontSize: 11,
    color: COLORS.border,
    textAlign: 'center',
    marginTop: 8,
    paddingBottom: 4,
  },
});
