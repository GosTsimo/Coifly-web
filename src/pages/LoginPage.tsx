import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import authService, { isAuthenticated } from '../services/authService';

type Mode = 'login' | 'register';

type NavState = {
  bookingState?: { salonId?: number; salonName?: string };
};

function flattenErrors(errors?: Record<string, string[]>) {
  if (!errors) {
    return [] as string[];
  }
  return Object.values(errors).flat();
}

function isAdminUser(user?: { role?: string | null; roles?: string[] }) {
  const primaryRole = user?.role?.toLowerCase();
  const roles = (user?.roles || []).map((role) => role.toLowerCase());
  return primaryRole === 'admin' || roles.includes('admin');
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = useMemo(() => (location.state || {}) as NavState, [location.state]);

  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigateAfterAuth = (user?: { role?: string | null; roles?: string[] }) => {
    if (isAdminUser(user)) {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    navigate('/client/home', { state: navState.bookingState, replace: true });
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }
    const rawUser = localStorage.getItem('coifly_user');
    const storedUser = rawUser ? (JSON.parse(rawUser) as { role?: string | null; roles?: string[] }) : undefined;
    navigateAfterAuth(storedUser);
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    if (mode === 'register' && password !== confirmPassword) {
      setError('La confirmation du mot de passe ne correspond pas.');
      return;
    }

    setLoading(true);

    if (mode === 'login') {
      const result = await authService.loginUser(emailOrPhone.trim(), password);
      if (!result.success) {
        setError(result.message || flattenErrors(result.errors)[0] || 'Connexion impossible');
        setLoading(false);
        return;
      }
      navigateAfterAuth(result.data?.user);
      return;
    }

    const registerResult = await authService.registerUser({
      name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      password,
      password_confirmation: confirmPassword,
    });

    if (!registerResult.success) {
      setError(registerResult.message || flattenErrors(registerResult.errors)[0] || 'Inscription impossible');
      setLoading(false);
      return;
    }

    navigateAfterAuth(registerResult.data?.user);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(195,156,86,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.15),transparent_30%),#0B0B0F] text-white">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <a href="https://www.coifly.app/salon/testtt" className="inline-flex items-center gap-2 text-text-secondary hover:text-gold transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </a>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-6 items-stretch">
          <motion.aside
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl border border-white/10 bg-dark-surface/80 backdrop-blur p-7 sm:p-8"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-gold">Coifly Access</p>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mt-3">Connectez-vous pour reserver en quelques secondes.</h1>
            <p className="text-text-secondary mt-4 text-sm sm:text-base">
              Votre historique, vos favoris, vos reservations et vos notifications restent synchronises.
            </p>

            <div className="mt-8 space-y-3">
              <div className="rounded-xl border border-white/10 p-4 bg-white/[0.02]">
                <p className="font-semibold">Reservation intelligente</p>
                <p className="text-text-secondary text-sm mt-1">Affectation des coiffeurs par service et slots en temps reel.</p>
              </div>
              <div className="rounded-xl border border-white/10 p-4 bg-white/[0.02]">
                <p className="font-semibold">Experience premium</p>
                <p className="text-text-secondary text-sm mt-1">Flow fluide, confirmations instantanees, recap detaille.</p>
              </div>
            </div>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="rounded-3xl border border-white/10 bg-dark-surface/90 p-6 sm:p-8"
          >
            <div className="inline-flex rounded-xl p-1 bg-dark-elevated/60 border border-white/10 mb-6 w-full">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-gold text-dark' : 'text-text-secondary hover:text-text-primary'}`}
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'register' ? 'bg-gold text-dark' : 'text-text-secondary hover:text-text-primary'}`}
              >
                Inscription
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <label className="block">
                  <span className="text-sm text-text-secondary">Nom complet</span>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-dark-elevated/40 px-3">
                    <User className="w-4 h-4 text-text-muted" />
                    <input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="w-full bg-transparent py-3 outline-none text-text-primary"
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                </label>
              )}

              {mode === 'login' ? (
                <label className="block">
                  <span className="text-sm text-text-secondary">Email ou telephone</span>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-dark-elevated/40 px-3">
                    <Mail className="w-4 h-4 text-text-muted" />
                    <input
                      value={emailOrPhone}
                      onChange={(event) => setEmailOrPhone(event.target.value)}
                      className="w-full bg-transparent py-3 outline-none text-text-primary"
                      placeholder="email@exemple.com ou 06..."
                      required
                    />
                  </div>
                </label>
              ) : (
                <>
                  <label className="block">
                    <span className="text-sm text-text-secondary">Telephone</span>
                    <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-dark-elevated/40 px-3">
                      <Phone className="w-4 h-4 text-text-muted" />
                      <input
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        className="w-full bg-transparent py-3 outline-none text-text-primary"
                        placeholder="06 00 00 00 00"
                        required
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-sm text-text-secondary">Email (optionnel)</span>
                    <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-dark-elevated/40 px-3">
                      <Mail className="w-4 h-4 text-text-muted" />
                      <input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full bg-transparent py-3 outline-none text-text-primary"
                        placeholder="email@exemple.com"
                      />
                    </div>
                  </label>
                </>
              )}

              <label className="block">
                <span className="text-sm text-text-secondary">Mot de passe</span>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-dark-elevated/40 px-3">
                  <Lock className="w-4 h-4 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent py-3 outline-none text-text-primary"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="text-text-muted hover:text-text-primary">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </label>

              {mode === 'register' && (
                <label className="block">
                  <span className="text-sm text-text-secondary">Confirmation mot de passe</span>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-dark-elevated/40 px-3">
                    <Lock className="w-4 h-4 text-text-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full bg-transparent py-3 outline-none text-text-primary"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </label>
              )}

              {error && (
                <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3.5 font-bold bg-gold text-dark hover:bg-gold-light transition-colors disabled:opacity-60"
              >
                {loading ? 'Veuillez patienter...' : mode === 'login' ? 'Se connecter' : 'Creer mon compte'}
              </button>
            </form>
          </motion.section>
        </div>
      </div>
    </div>
  );
}