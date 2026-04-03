import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, Eye, EyeOff, Mail, Lock, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      if (email.trim() === 'admin@smartstock.com' && password === 'admin123') {
        login()
        navigate('/', { replace: true })
      } else {
        setError('Invalid credentials. Systems locked.')
      }
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#8b5cf6]/20 blur-[150px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-info/20 blur-[100px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGg0MHY0MEgwem0zOSAzOUgxVjFoMzh2Mzh6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMyKSIvPgo8L3N2Zz4=')] opacity-50" />

      {/* Main Glass Container */}
      <div className="relative z-10 w-full max-w-[1000px] bg-card backdrop-blur-glass border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row animate-in fade-in zoom-in-95 duration-700">
        
        {/* Left Side: Brand Visuals */}
        <div className="w-full lg:w-5/12 p-8 lg:p-12 relative flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 bg-gradient-to-br from-white/5 to-transparent">
          
          <div className="absolute inset-0 bg-primary/5 backdrop-blur-[2px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-2xl bg-primary/20 border border-primary/40 shadow-neon-purple relative group cursor-pointer transition-transform hover:scale-105">
                <div className="absolute inset-0 bg-primary rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                <Store className="h-8 w-8 text-primary relative z-10" />
              </div>
              <span className="text-3xl font-display font-bold text-white tracking-tight drop-shadow-md">
                SmartStock
              </span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-display font-black text-white leading-[1.1] mb-6 drop-shadow-sm">
              Inventory <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#8b5cf6] to-info drop-shadow-none">Reimagined</span>
            </h2>
            
            <p className="text-muted-foreground font-medium text-lg leading-relaxed mb-8">
              Experience the future of retail management. Track, optimize, and scale with intelligence.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm shadow-inner hover:bg-black/30 transition-colors">
              <div className="p-2.5 rounded-xl bg-success/20 text-success shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white drop-shadow-sm">Predictive Scaling</p>
                <p className="text-xs text-muted-foreground mt-0.5">AI-driven demand forecasts</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm shadow-inner hover:bg-black/30 transition-colors">
              <div className="p-2.5 rounded-xl bg-[#8b5cf6]/20 text-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white drop-shadow-sm">Bank-grade Security</p>
                <p className="text-xs text-muted-foreground mt-0.5">End-to-end encryption details</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-7/12 p-8 lg:p-16 flex items-center justify-center relative bg-black/40">
          
          <div className="w-full max-w-sm relative z-10">
            <div className="mb-10 text-center lg:text-left">
              <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-5 border border-primary/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                <Sparkles className="h-4 w-4 text-primary mr-2" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest pr-2">Secure Gateway</span>
              </div>
              <h3 className="text-3xl font-display font-bold text-white mb-2 tracking-tight drop-shadow-sm">Access Portal</h3>
              <p className="text-sm text-muted-foreground font-medium">Authenticate to enter your dashboard.</p>
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-3 bg-critical/10 text-critical border border-critical/30 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-in fade-in slide-in-from-top-2">
                <Lock className="h-4 w-4 shrink-0" /> 
                <span className="font-bold">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              
              <div className="space-y-2 group">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider group-focus-within:text-primary transition-colors">
                  Identification Entity
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@smartstock.com"
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-white text-sm font-medium bg-black/30 border border-white/10 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner transition-all placeholder:text-white/20"
                  />
                  <div className="absolute inset-0 rounded-xl border border-primary/0 group-focus-within:shadow-[0_0_15px_rgba(34,197,94,0.3)] pointer-events-none transition-all" />
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider group-focus-within:text-primary transition-colors">
                    Passkey
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-[10px] font-bold text-primary/80 hover:text-primary transition-colors uppercase tracking-wider bg-primary/10 px-2 py-1 rounded-md"
                  >
                    Recover
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl text-white text-sm font-medium bg-black/30 border border-white/10 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner transition-all placeholder:text-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  <div className="absolute inset-0 rounded-xl border border-primary/0 group-focus-within:shadow-[0_0_15px_rgba(34,197,94,0.3)] pointer-events-none transition-all" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-3 transition-all relative overflow-hidden group mt-8 bg-primary hover:bg-primary/90 hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] active:scale-[0.98] border border-primary/50 disabled:opacity-70 disabled:pointer-events-none disabled:active:scale-100"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin shadow-sm" />
                    Authenticating Node...
                  </>
                ) : (
                  <>
                    Initiate Sequence
                    <div className="p-1 rounded-md bg-white/20 group-hover:bg-white/30 transition-colors shadow-sm">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                  </>
                )}
                
                {/* Subtle internal shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>

              <div className="text-center mt-6">
                <p className="text-sm font-medium text-muted-foreground">
                  No authorization token?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/create-account')}
                    className="font-bold text-white hover:text-primary transition-colors underline decoration-white/20 hover:decoration-primary/50 underline-offset-4"
                  >
                    Request Access
                  </button>
                </p>
              </div>

            </form>
          </div>
        </div>

      </div>
      
      {/* Bottom subtle copyright */}
      <div className="absolute bottom-6 text-[10px] font-bold text-white/20 tracking-widest uppercase cursor-default pointer-events-none">
        SmartStock OS v2.0 © {new Date().getFullYear()}
      </div>
    </div>
  )
}

export default Login