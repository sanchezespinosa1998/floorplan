import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, MapPin, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { users } from '@/data/mockData';
import { getHomePathForRole } from '@/lib/authorization';

const STORAGE_KEY = 'fairplan-active-user-id';
const STORAGE_KEY_FAIR = 'fairplan-active-fair-id';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginByEmail = (rawEmail: string) => {
    const matchedUser = users.find((user) => user.email.toLowerCase() === rawEmail.toLowerCase());

    if (!matchedUser) {
      setError('No user found with this email.');
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, matchedUser.id);
    window.localStorage.removeItem(STORAGE_KEY_FAIR);
    navigate(getHomePathForRole(matchedUser.role));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }

    const matchedUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase());
    if (!matchedUser) {
      setError('Email not recognised. Try one of the demo profiles below.');
      return;
    }

    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      loginByEmail(matchedUser.email);
    }, 1200);
  };

  return (
    <div className='min-h-[100dvh] flex items-center justify-center relative overflow-hidden bg-background py-6 sm:py-0'>
      {/* Background grid */}
      <div className='absolute inset-0 opacity-[0.03]'>
        <svg className='w-full h-full' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'>
              <path
                d='M 60 0 L 0 0 0 60'
                fill='none'
                stroke='currentColor'
                strokeWidth='0.5'
                className='text-primary'
              />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#grid)' />
        </svg>
      </div>

      {/* Gradient orbs */}
      <div className='absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px]' />
      <div className='absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]' />

      {/* Corner accents */}
      <div className='absolute top-0 left-0 w-16 h-16 sm:w-40 sm:h-40 border-l-2 border-t-2 border-primary/30' />
      <div className='absolute top-0 right-0 w-16 h-16 sm:w-40 sm:h-40 border-r-2 border-t-2 border-primary/30' />
      <div className='absolute bottom-0 left-0 w-16 h-16 sm:w-40 sm:h-40 border-l-2 border-b-2 border-primary/30' />
      <div className='absolute bottom-0 right-0 w-16 h-16 sm:w-40 sm:h-40 border-r-2 border-b-2 border-primary/30' />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md px-4 sm:px-6 relative z-10 max-h-[95dvh] overflow-y-auto'
      >
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className='text-center mb-8'
        >
          <div className='inline-flex items-center justify-center w-14 h-14 bg-primary mb-4 mx-auto'>
            <MapPin className='w-7 h-7 text-black' />
          </div>
          <h1 className='text-3xl font-bold text-foreground tracking-tight'>PortfolioMap</h1>
          <p className='text-sm text-muted-foreground mt-1'>3D portfolio &amp; exposure visualizer · €1.2 B AUM</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className='bg-card border border-border p-6'
        >
          <div className='mb-5'>
            <h2 className='text-lg font-semibold text-foreground'>Sign in</h2>
            <p className='text-xs text-muted-foreground mt-1'>Demo environment — pick a profile below or use any seeded email.</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className='mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm'
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label htmlFor='login-email' className='text-xs font-medium text-foreground'>
                Email
              </label>
              <input
                id='login-email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='you@portfoliomap.io'
                autoComplete='email'
                className='mt-1.5 w-full px-3 py-2.5 bg-background border border-border text-foreground text-sm outline-none focus:border-primary transition-colors'
              />
            </div>

            <div>
              <label htmlFor='login-password' className='text-xs font-medium text-foreground'>
                Password
              </label>
              <div className='relative mt-1.5'>
                <input
                  id='login-password'
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  autoComplete='current-password'
                  className='w-full px-3 py-2.5 bg-background border border-border text-foreground text-sm outline-none focus:border-primary transition-colors pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowPass(!showPass)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                >
                  {showPass ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                </button>
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full py-2.5 bg-primary text-black font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative'
            >
              <span
                className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}
              >
                <Sparkles className='w-4 h-4' />
                Sign in
              </span>
              {loading && (
                <motion.div
                  className='absolute inset-0 flex items-center justify-center'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Loader2 className='w-5 h-5 text-black animate-spin' />
                </motion.div>
              )}
            </button>
          </form>

          <div className='mt-5 pt-4 border-t border-border'>
            <p className='text-[11px] text-muted-foreground mb-2'>Demo profiles:</p>
            <div className='flex flex-wrap gap-2'>
              {users.slice(0, 4).map((user) => (
                <button
                  key={user.id}
                  type='button'
                  onClick={() => {
                    setEmail(user.email);
                    setPassword('demo');
                  }}
                  className='text-xs px-2 py-1 bg-secondary text-muted-foreground hover:text-foreground transition-colors'
                >
                  {user.email}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='text-center text-xs text-muted-foreground mt-6'
        >
          © 2026 PortfolioMap Capital · Institutional asset management platform
        </motion.p>
      </motion.div>
    </div>
  );
}