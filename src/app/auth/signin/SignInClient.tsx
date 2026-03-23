'use client';

import { Button, Card, Input } from '@/components';
import { COUNTRIES, registerSchema, loginSchema, type RegisterFormData, type LoginFormData } from '@/lib/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

/* ─── Registration step definitions ─── */
const STEPS = [
  { id: 'personal', title: 'Personal Info', icon: '👤' },
  { id: 'address',  title: 'Address',       icon: '🏠' },
  { id: 'account',  title: 'Account',       icon: '🔐' },
] as const;

/* ─── Step indicator (top bar) ─── */
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8">
      {/* Circles + lines row */}
      <div className="flex items-center">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div
              className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold shrink-0 transition-all duration-300 ${
                i < current
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : i === current
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md shadow-blue-600/30'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}
            >
              {i < current ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {/* Connecting line */}
            {i < total - 1 && (
              <div className="flex-1 h-[2px] mx-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    i < current ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Labels row */}
      <div className="flex mt-2">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`flex-1 text-center text-[11px] font-medium transition-colors duration-300 ${
              i <= current ? 'text-blue-600' : 'text-slate-400'
            } ${i === STEPS.length - 1 ? 'text-right pr-1' : i === 0 ? 'text-left pl-1' : ''}`}
          >
            {s.title}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main component ─── */
export default function SignInClient() {
  const search = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const callbackUrl = search.get('callbackUrl') || '/dashboard';
  const mode = search.get('mode') || 'login';
  const isSignup = mode === 'signup';

  /* ─── Login form ─── */
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  /* ─── Register form ─── */
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '', lastName: '', email: '', password: '',
      phone: '', street: '', city: '', country: '', postalCode: '', dateOfBirth: '',
    },
    mode: 'onTouched',
  });

  /* ─── Navigate steps with per-step validation ─── */
  const stepFields: (keyof RegisterFormData)[][] = [
    ['firstName', 'lastName', 'phone', 'dateOfBirth'],
    ['street', 'city', 'country', 'postalCode'],
    ['email', 'password'],
  ];

  const nextStep = async () => {
    const valid = await registerForm.trigger(stepFields[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  /* ─── Submit login ─── */
  const onLogin = async (data: LoginFormData) => {
    setError(null);
    setLoading(true);
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.ok) {
      router.push(callbackUrl);
    } else {
      setError('Invalid email or password');
    }
  };

  /* ─── Submit register ─── */
  const onRegister = async (data: RegisterFormData) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.message || 'Registration failed');
      }
      await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: true,
        callbackUrl,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Max date for DOB (16 years ago) ─── */
  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 16);
  const maxDobStr = maxDob.toISOString().split('T')[0];

  /* ─── RENDER ─── */
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={isSignup ? 'w-full max-w-lg' : 'w-full max-w-md'}
      >
        {/* Logo / brand */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isSignup
              ? 'Fill in the details below to get started with Invoicerly.'
              : 'Sign in to continue to your dashboard.'}
          </p>
        </div>

        <Card className="!p-6 sm:!p-8 shadow-xl border-0 bg-white/80 backdrop-blur">
          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm p-3 font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════ LOGIN MODE ═══════ */}
          {!isSignup && (
            <form className="grid gap-4" onSubmit={loginForm.handleSubmit(onLogin)}>
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={loginForm.formState.errors.email?.message}
                {...loginForm.register('email')}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={loginForm.formState.errors.password?.message}
                {...loginForm.register('password')}
              />
              <div className="mt-2">
                <Button type="submit" disabled={loading} variant="primary" className="w-full">
                  {loading ? 'Signing in…' : 'Log in'}
                </Button>
              </div>
              <p className="text-center text-sm text-slate-500">
                Don&apos;t have an account?{' '}
                <a href="?mode=signup" className="text-blue-600 font-medium hover:underline">
                  Create account
                </a>
              </p>
            </form>
          )}

          {/* ═══════ SIGNUP MODE ═══════ */}
          {isSignup && (
            <>
              <StepIndicator current={step} total={STEPS.length} />

              <form onSubmit={registerForm.handleSubmit(onRegister)}>
                <AnimatePresence mode="wait">
                  {/* ── Step 1: Personal info ── */}
                  {step === 0 && (
                    <motion.div
                      key="step-0"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25 }}
                      className="grid gap-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="First Name *"
                          placeholder="John"
                          error={registerForm.formState.errors.firstName?.message}
                          {...registerForm.register('firstName')}
                        />
                        <Input
                          label="Last Name *"
                          placeholder="Doe"
                          error={registerForm.formState.errors.lastName?.message}
                          {...registerForm.register('lastName')}
                        />
                      </div>
                      <Input
                        label="Phone Number *"
                        type="tel"
                        placeholder="+44 7911 123456"
                        error={registerForm.formState.errors.phone?.message}
                        {...registerForm.register('phone')}
                      />
                      <Input
                        label="Date of Birth *"
                        type="date"
                        max={maxDobStr}
                        error={registerForm.formState.errors.dateOfBirth?.message}
                        {...registerForm.register('dateOfBirth')}
                      />
                    </motion.div>
                  )}

                  {/* ── Step 2: Address ── */}
                  {step === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25 }}
                      className="grid gap-4"
                    >
                      <Input
                        label="Street Address *"
                        placeholder="123 Main Street, Apt 4"
                        error={registerForm.formState.errors.street?.message}
                        {...registerForm.register('street')}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="City *"
                          placeholder="London"
                          error={registerForm.formState.errors.city?.message}
                          {...registerForm.register('city')}
                        />
                        <Input
                          label="Postal Code *"
                          placeholder="EC1A 1BB"
                          error={registerForm.formState.errors.postalCode?.message}
                          {...registerForm.register('postalCode')}
                        />
                      </div>
                      {/* Country select */}
                      <div className="grid gap-1.5">
                        <label className="text-xs text-slate-600 font-medium">Country *</label>
                        <select
                          className={`w-full rounded-lg border px-2.5 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-slate-400/20 transition-all duration-200 bg-white ${
                            registerForm.formState.errors.country ? 'border-red-400' : 'border-black/10'
                          }`}
                          {...registerForm.register('country')}
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select your country
                          </option>
                          {COUNTRIES.map((c: string) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        {registerForm.formState.errors.country && (
                          <p className="text-xs text-red-500">
                            {registerForm.formState.errors.country.message}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* ── Step 3: Account ── */}
                  {step === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25 }}
                      className="grid gap-4"
                    >
                      <Input
                        label="Email *"
                        type="email"
                        placeholder="you@example.com"
                        error={registerForm.formState.errors.email?.message}
                        {...registerForm.register('email')}
                      />
                      <Input
                        label="Password *"
                        type="password"
                        placeholder="Min. 8 characters"
                        error={registerForm.formState.errors.password?.message}
                        {...registerForm.register('password')}
                      />
                      <p className="text-xs text-slate-400">
                        Password must be at least 8 characters long.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation buttons */}
                <div className="flex items-center gap-3 mt-6">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </button>
                  ) : (
                    <span />
                  )}

                  {step < STEPS.length - 1 ? (
                    <Button type="button" variant="primary" onClick={nextStep} className="ml-auto w-full sm:w-auto">
                      Continue →
                    </Button>
                  ) : (
                    <Button type="submit" variant="primary" disabled={loading} className="ml-auto w-full sm:w-auto">
                      {loading ? 'Creating account…' : 'Create account'}
                    </Button>
                  )}
                </div>
              </form>

              {/* Divider */}
              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{' '}
                  <a href="?mode=login" className="text-blue-600 font-medium hover:underline">
                    Log in
                  </a>
                </p>
              </div>
            </>
          )}
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-4">
          By continuing, you agree to our{' '}
          <a href="/terms" className="underline hover:text-slate-600">Terms</a> and{' '}
          <a href="/privacy" className="underline hover:text-slate-600">Privacy Policy</a>.
        </p>
      </motion.div>
    </main>
  );
}
