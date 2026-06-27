import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
    } else {
      const { error } = await signUp(email, password)
      if (error) setError(error.message)
      else setMessage('Revisa tu correo para confirmar tu cuenta.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / title */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-accent rounded-xl mb-4">
            <span className="text-2xl">🌱</span>
          </div>
          <h1 className="text-2xl font-semibold text-ink">Hábitos</h1>
          <p className="text-sm text-ink-muted mt-1">Construye tu mejor versión, un día a la vez</p>
        </div>

        <div className="card p-6">
          {/* Mode toggle */}
          <div className="flex bg-surface-100 rounded p-1 mb-6">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setMessage('') }}
                className={`flex-1 py-1.5 text-sm font-medium rounded transition-all ${
                  mode === m ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="label">Correo electrónico</label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                className="input" placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                className="input" placeholder="••••••••"
                minLength={6}
              />
            </div>

            {error && <p className="text-xs text-danger bg-red-50 px-3 py-2 rounded">{error}</p>}
            {message && <p className="text-xs text-accent bg-green-50 px-3 py-2 rounded">{message}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
