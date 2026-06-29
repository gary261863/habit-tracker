import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAdmin } from "../hooks/useAdmin";
import { Navigate } from "react-router-dom";
import {
  Users,
  Mail,
  BarChart2,
  Trash2,
  UserCheck,
  UserX,
  Plus,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const TABS = [
  { id: "users", label: "Usuarios", icon: Users },
  { id: "emails", label: "Lista blanca", icon: Mail },
  { id: "stats", label: "Estadísticas", icon: BarChart2 },
];

// ── Stat card ────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color = "text-accent" }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`${color} bg-current/10 p-2 rounded-lg`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-2xl font-semibold font-mono text-ink">
          {value ?? "—"}
        </p>
        <p className="text-xs text-ink-muted">{label}</p>
      </div>
    </div>
  );
}

// ── Users tab ────────────────────────────────────────────────
function UsersTab({ users, loading, onToggle, onDelete }) {
  const [confirm, setConfirm] = useState(null);
  const { user: me } = useAuth();

  const handleDelete = async () => {
    if (!confirm) return;
    await onDelete(confirm.id);
    setConfirm(null);
  };

  if (loading)
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 bg-surface-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );

  return (
    <div>
      <p className="text-xs text-ink-muted mb-3">
        {users.length} usuario{users.length !== 1 ? "s" : ""} registrado
        {users.length !== 1 ? "s" : ""}
      </p>
      <div className="space-y-2">
        {users.map((u) => (
          <div
            key={u.id}
            className={`card px-4 py-3 flex items-center gap-3 ${
              !u.is_active ? "opacity-60" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-accent">
                {u.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{u.email}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    u.is_admin
                      ? "bg-yellow-100 text-yellow-700"
                      : u.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {u.is_admin ? "Admin" : u.is_active ? "Activo" : "Inactivo"}
                </span>
                <span className="text-[10px] text-ink-muted">
                  Registrado{" "}
                  {u.created_at
                    ? format(new Date(u.created_at), "d MMM yyyy", {
                        locale: es,
                      })
                    : "—"}
                </span>
                {u.last_seen_at && (
                  <span className="text-[10px] text-ink-muted hidden sm:inline">
                    · Último acceso{" "}
                    {format(new Date(u.last_seen_at), "d MMM", { locale: es })}
                  </span>
                )}
              </div>
            </div>
            {/* No puedes modificarte a ti mismo */}
            {u.id !== me?.id && !u.is_admin && (
              <div className="flex gap-1">
                <button
                  onClick={() => onToggle(u.id, u.is_active)}
                  className="btn-ghost px-2 py-1 text-ink-muted"
                  title={u.is_active ? "Desactivar" : "Activar"}
                >
                  {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                </button>
                <button
                  onClick={() => setConfirm(u)}
                  className="btn-ghost px-2 py-1 text-danger"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-sm text-ink-muted text-center py-8">
            No hay usuarios registrados aún.
          </p>
        )}
      </div>

      {/* Confirm delete */}
      {confirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="font-semibold text-ink mb-2">Eliminar usuario</h3>
            <p className="text-sm text-ink-soft mb-1">
              ¿Eliminar a <strong>{confirm.email}</strong>?
            </p>
            <p className="text-xs text-ink-muted mb-4">
              Se borrarán todos sus hábitos, categorías y registros. Esta acción
              no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="btn-danger">
                Eliminar todo
              </button>
              <button onClick={() => setConfirm(null)} className="btn-ghost">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Emails tab ───────────────────────────────────────────────
function EmailsTab({ allowedEmails, users, onAdd, onRemove }) {
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const registeredEmails = new Set(users.map((u) => u.email?.toLowerCase()));

  const handleAdd = async () => {
    setError("");
    if (!newEmail.trim()) return;
    const emailLower = newEmail.toLowerCase().trim();
    if (allowedEmails.some((e) => e.email === emailLower)) {
      setError("Este email ya está en la lista.");
      return;
    }
    setAdding(true);
    const { error } = await onAdd(emailLower);
    if (error) setError(error.message);
    else setNewEmail("");
    setAdding(false);
  };

  return (
    <div>
      {/* Add email */}
      <div className="card p-4 mb-4">
        <label className="label">Agregar email autorizado</label>
        <div className="flex gap-2">
          <input
            type="email"
            className="input flex-1"
            placeholder="amigo@email.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newEmail.trim()}
            className="btn-primary"
          >
            <Plus size={15} /> Agregar
          </button>
        </div>
        {error && <p className="text-xs text-danger mt-2">{error}</p>}
      </div>

      <p className="text-xs text-ink-muted mb-3">
        {allowedEmails.length} email{allowedEmails.length !== 1 ? "s" : ""}{" "}
        autorizado{allowedEmails.length !== 1 ? "s" : ""}
      </p>

      <div className="space-y-2">
        {allowedEmails.map((e) => {
          const isRegistered = registeredEmails.has(e.email);
          return (
            <div key={e.id} className="card px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">
                  {e.email}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      isRegistered
                        ? "bg-green-100 text-green-700"
                        : "bg-surface-200 text-ink-muted"
                    }`}
                  >
                    {isRegistered ? "Registrado ✓" : "Pendiente"}
                  </span>
                  <span className="text-[10px] text-ink-muted">
                    Agregado{" "}
                    {format(new Date(e.created_at), "d MMM yyyy", {
                      locale: es,
                    })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onRemove(e.id)}
                className="btn-ghost px-2 py-1 text-danger"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
        {allowedEmails.length === 0 && (
          <p className="text-sm text-ink-muted text-center py-8">
            No hay emails en la lista blanca. Agrega uno arriba.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Stats tab ────────────────────────────────────────────────
function StatsTab({ users, fetchGlobalStats }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchGlobalStats().then(setStats);
  }, [fetchGlobalStats]);

  const activeUsers = users.filter((u) => u.is_active).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Usuarios totales"
          value={stats?.totalUsers}
          icon={Users}
        />
        <StatCard
          label="Usuarios activos"
          value={activeUsers}
          icon={UserCheck}
          color="text-green-600"
        />
        <StatCard
          label="Hábitos creados"
          value={stats?.totalHabits}
          icon={BarChart2}
          color="text-blue-600"
        />
        <StatCard
          label="Hábitos completados"
          value={stats?.totalLogs}
          icon={Mail}
          color="text-purple-600"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-ink-soft uppercase tracking-wider mb-3">
          Usuarios registrados
        </h3>
        <div className="card divide-y divide-surface-100">
          {users.map((u) => (
            <div key={u.id} className="px-4 py-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-accent">
                  {u.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-ink flex-1 truncate">
                {u.email}
              </span>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  u.is_admin
                    ? "bg-yellow-100 text-yellow-700"
                    : u.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {u.is_admin ? "Admin" : u.is_active ? "Activo" : "Inactivo"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main AdminPage ───────────────────────────────────────────
export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = useState("users");
  const {
    users,
    allowedEmails,
    loading,
    fetchAll,
    toggleActive,
    deleteUser,
    addAllowedEmail,
    removeAllowedEmail,
    fetchGlobalStats,
  } = useAdmin();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">
          Panel de administración
        </h1>
        <p className="text-sm text-ink-muted mt-0.5">
          Gestiona usuarios y accesos
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 rounded-lg p-1 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded transition-all ${
              tab === id
                ? "bg-white text-ink shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <Icon size={13} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {tab === "users" && (
        <UsersTab
          users={users}
          loading={loading}
          onToggle={toggleActive}
          onDelete={deleteUser}
        />
      )}
      {tab === "emails" && (
        <EmailsTab
          allowedEmails={allowedEmails}
          users={users}
          onAdd={addAllowedEmail}
          onRemove={removeAllowedEmail}
        />
      )}
      {tab === "stats" && (
        <StatsTab users={users} fetchGlobalStats={fetchGlobalStats} />
      )}
    </div>
  );
}
