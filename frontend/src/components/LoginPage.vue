<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const { login, signup } = useAuth()

const mode = ref('login')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const form = ref({
  fullName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
})

const switchMode = (newMode) => {
  mode.value = newMode
  error.value = ''
  form.value = { fullName: '', email: '', password: '', passwordConfirmation: '' }
}

const handleSubmit = async () => {
  error.value = ''
  loading.value = true
  try {
    if (mode.value === 'login') {
      await login({ email: form.value.email, password: form.value.password })
    } else {
      await signup({
        fullName: form.value.fullName,
        email: form.value.email,
        password: form.value.password,
        passwordConfirmation: form.value.passwordConfirmation,
      })
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.errors) {
      const messages = err.response.data.errors.map((e) => e.message).join(', ')
      error.value = messages
    } else if (err.response && err.response.status === 401) {
      error.value = 'Invalid email or password.'
    } else {
      error.value = 'Something went wrong. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-left">
      <div class="brand">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="4" fill="#3b82f6" />
            <path d="M8 12l3 3 5-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <span class="brand-name">TaskFlow</span>
      </div>

      <h1 class="headline">
        Master your workflow<br />with <span class="accent">precision.</span>
      </h1>

      <p class="tagline">
        The professional standard for team task management.<br />
        Streamline operations, track milestones, and achieve clarity in<br />
        every project phase.
      </p>

      <div class="hero-image">
        <div class="hero-shape shape-1"></div>
        <div class="hero-shape shape-2"></div>
        <div class="hero-shape shape-3"></div>
        <div class="hero-shape shape-4"></div>
        <div class="hero-shape shape-5"></div>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="stat-value">2.4k+</div>
          <div class="stat-label">Active Teams</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <div class="stat-value">99.9%</div>
          <div class="stat-label">Uptime Rate</div>
        </div>
      </div>
    </div>

    <div class="auth-right">
      <div class="auth-form-wrapper">
        <h2 class="form-title">{{ mode === 'login' ? 'Welcome Back' : 'Create Account' }}</h2>
        <p class="form-subtitle">
          {{ mode === 'login' ? 'Please enter your credentials to access your workspace.' : 'Sign up to start managing your tasks efficiently.' }}
        </p>

        <form class="auth-form" @submit.prevent="handleSubmit">
          <div v-if="mode === 'signup'" class="form-group">
            <label>Full Name</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <input
                v-model="form.fullName"
                type="text"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Corporate Email</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <input
                v-model="form.email"
                type="email"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <div class="label-row">
              <label>Password</label>
              <a v-if="mode === 'login'" href="#" class="forgot-link" @click.prevent>Forgot password?</a>
            </div>
            <div class="input-wrapper">
              <span class="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <div v-if="mode === 'signup'" class="form-group">
            <label>Confirm Password</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input
                v-model="form.passwordConfirmation"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div v-if="mode === 'login'" class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" />
              <span>Keep me logged in for 30 days</span>
            </label>
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>

          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Please wait...' : (mode === 'login' ? 'SIGN IN' : 'SIGN UP') }}
            <span class="btn-arrow">→</span>
          </button>
        </form>

        <div class="divider">
          <span>OR CONTINUE WITH</span>
        </div>

        <div class="social-buttons">
          <button type="button" class="social-btn" @click.prevent>
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity=".9"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" opacity=".7"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity=".6"/></svg>
            Google
          </button>
          <button type="button" class="social-btn" @click.prevent>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            GitHub
          </button>
        </div>

        <p class="switch-text">
          {{ mode === 'login' ? "Don't have an account?" : 'Already have an account?' }}
          <a href="#" @click.prevent="switchMode(mode === 'login' ? 'signup' : 'login')">
            {{ mode === 'login' ? 'Sign up' : 'Sign in' }}
          </a>
        </p>

        <div class="footer-links">
          <a href="#" @click.prevent>Privacy Policy</a>
          <a href="#" @click.prevent>Terms of Service</a>
          <a href="#" @click.prevent>Support</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: #0a0a0f;
}

.auth-left {
  flex: 1;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.auth-left::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.logo {
  width: 40px;
  height: 40px;
}

.logo svg {
  width: 100%;
  height: 100%;
}

.brand-name {
  font-size: 24px;
  font-weight: 700;
  color: #3b82f6;
  letter-spacing: -0.5px;
}

.headline {
  font-size: 48px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.15;
  margin: 48px 0 24px;
  letter-spacing: -1.5px;
  position: relative;
  z-index: 1;
}

.headline .accent {
  color: #3b82f6;
}

.tagline {
  color: #94a3b8;
  font-size: 15px;
  line-height: 1.7;
  position: relative;
  z-index: 1;
}

.hero-image {
  width: 100%;
  height: 260px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%);
  border-radius: 12px;
  margin: 32px 0;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.hero-shape {
  position: absolute;
  background: rgba(59, 130, 246, 0.3);
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.shape-1 {
  width: 120px;
  height: 120px;
  top: 30px;
  left: 40px;
  transform: rotate(15deg);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(139, 92, 246, 0.3));
}

.shape-2 {
  width: 80px;
  height: 80px;
  top: 60px;
  left: 180px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.4), rgba(59, 130, 246, 0.3));
}

.shape-3 {
  width: 100px;
  height: 60px;
  bottom: 50px;
  left: 80px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.2));
  transform: rotate(-10deg);
}

.shape-4 {
  width: 70px;
  height: 70px;
  bottom: 70px;
  right: 60px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.35), rgba(96, 165, 250, 0.25));
}

.shape-5 {
  width: 90px;
  height: 40px;
  top: 100px;
  right: 100px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.2));
  transform: rotate(20deg);
}

.stats {
  display: flex;
  align-items: center;
  gap: 32px;
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: #334155;
}

.auth-right {
  flex: 1;
  background: #0a0a0f;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.auth-form-wrapper {
  width: 100%;
  max-width: 420px;
}

.form-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.form-subtitle {
  color: #94a3b8;
  font-size: 14px;
  margin-bottom: 32px;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  color: #3b82f6;
  font-size: 13px;
  text-decoration: none;
  font-weight: 500;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #64748b;
  display: flex;
  align-items: center;
}

.input-icon svg {
  width: 18px;
  height: 18px;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 14px 14px 44px;
  background: #111118;
  border: 1px solid #1e293b;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.input-wrapper input::placeholder {
  color: #475569;
}

.toggle-password {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.toggle-password svg {
  width: 18px;
  height: 18px;
}

.checkbox-group {
  margin-bottom: 24px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 400;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
  cursor: pointer;
}

.error-msg {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 16px;
}

.btn-submit {
  width: 100%;
  padding: 14px;
  background: #3b82f6;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-arrow {
  font-size: 18px;
}

.divider {
  display: flex;
  align-items: center;
  margin: 28px 0;
  color: #475569;
  font-size: 12px;
  letter-spacing: 1px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #1e293b;
}

.divider span {
  padding: 0 16px;
}

.social-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
}

.social-btn {
  flex: 1;
  padding: 12px;
  background: #111118;
  border: 1px solid #1e293b;
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: border-color 0.2s;
}

.social-btn:hover {
  border-color: #3b82f6;
}

.switch-text {
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  margin-bottom: 32px;
}

.switch-text a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.footer-links a {
  color: #64748b;
  font-size: 12px;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #94a3b8;
}

@media (max-width: 900px) {
  .auth-left {
    display: none;
  }
  .auth-right {
    padding: 32px 20px;
  }
}
</style>
