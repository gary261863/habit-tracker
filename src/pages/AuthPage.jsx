import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const translateError = (msg) => {
  if (msg.includes("User already registered"))
    return "Este correo ya está registrado. Inicia sesión.";
  if (msg.includes("Invalid login credentials"))
    return "Correo o contraseña incorrectos.";
  if (msg.includes("Email not confirmed"))
    return "Confirma tu correo antes de iniciar sesión.";
  if (msg.includes("Password should be at least"))
    return "La contraseña debe tener al menos 6 caracteres.";
  if (msg.includes("Unable to validate email"))
    return "El correo ingresado no es válido.";
  return msg;
};

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) setError(translateError(error.message));
    } else {
      // Verificar lista blanca antes de registrar
      const { data: allowed, error: checkError } = await supabase
        .from("allowed_emails")
        .select("id")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (checkError || !allowed) {
        setError(
          "Este correo no está autorizado para registrarse. Contacta al administrador."
        );
        setLoading(false);
        return;
      }

      const { error } = await signUp(email, password);
      if (error) setError(translateError(error.message));
      else
        setMessage(
          "Revisa tu correo y confirma tu cuenta para poder iniciar sesión."
        );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-accent rounded-xl mb-4">
            <span className="text-2xl">🌱</span>
          </div>
          <h1 className="text-2xl font-semibold text-ink">Hábitos</h1>
          <p className="text-sm text-ink-muted mt-1">
            Construye tu mejor versión, un día a la vez
          </p>
        </div>

        <div className="card p-6">
          <div className="flex bg-surface-100 rounded p-1 mb-6">
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                  setMessage("");
                  setShowPassword(false);
                }}
                className={`flex-1 py-1.5 text-sm font-medium rounded transition-all ${
                  mode === m
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {m === "login" ? "Iniciar sesión" : "Registrarse"}
              </button>
            ))}
          </div>

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="label">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="tu@email.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  minLength={6}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-danger bg-red-50 px-3 py-2 rounded">
                {error}
              </p>
            )}
            {message && (
              <p className="text-xs text-accent bg-green-50 px-3 py-2 rounded">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading
                ? "Verificando..."
                : mode === "login"
                ? "Entrar"
                : "Crear cuenta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
