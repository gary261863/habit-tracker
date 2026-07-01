import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { COUNTRIES, getTimezoneForCountry } from "../lib/countries";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Check,
  Pencil,
  X,
  Camera,
  Loader2,
  Flag,
  Calendar,
} from "lucide-react";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.display_name || "");
  const [country, setCountry] = useState(profile?.country || "");
  const [birthDate, setBirthDate] = useState(profile?.birth_date || "");
  const [personalGoal, setPersonalGoal] = useState(
    profile?.personal_goal || ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef(null);

  // Sincroniza los campos del formulario cuando el perfil termina de cargar
  // (profile llega de forma asíncrona, así que el useState inicial puede quedar vacío)
  useEffect(() => {
    if (profile) {
      setName(profile.display_name || "");
      setCountry(profile.country || "");
      setBirthDate(profile.birth_date || "");
      setPersonalGoal(profile.personal_goal || "");
    }
  }, [profile]);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    if (!name.trim()) {
      setError("El nombre no puede estar vacío.");
      return;
    }
    setSaving(true);

    const timezone = country ? getTimezoneForCountry(country) : null;

    const { error } = await supabase
      .from("user_profiles")
      .update({
        display_name: name.trim(),
        country: country || null,
        timezone,
        birth_date: birthDate || null,
        personal_goal: personalGoal.trim() || null,
      })
      .eq("id", user.id);

    if (error) {
      setError("No se pudo guardar la información. Intenta de nuevo.");
    } else {
      setSuccess("Perfil actualizado correctamente.");
      setEditing(false);
      refreshProfile();
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setName(profile?.display_name || "");
    setCountry(profile?.country || "");
    setBirthDate(profile?.birth_date || "");
    setPersonalGoal(profile?.personal_goal || "");
    setEditing(false);
    setError("");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setAvatarError("Solo se permiten imágenes JPG, PNG o WEBP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setAvatarError("La imagen no puede pesar más de 2MB.");
      return;
    }

    setUploadingAvatar(true);

    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      setAvatarError("No se pudo subir la imagen. Intenta de nuevo.");
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateError) {
      setAvatarError(
        "La imagen se subió pero no se pudo guardar. Intenta de nuevo."
      );
    } else {
      refreshProfile();
    }

    setUploadingAvatar(false);
    e.target.value = "";
  };

  const initial = (profile?.display_name ||
    user?.email ||
    "?")[0].toUpperCase();
  const memberSince = profile?.created_at
    ? format(new Date(profile.created_at), "MMMM yyyy", { locale: es })
    : null;
  const timeSinceJoined = profile?.created_at
    ? `Hace ${formatDistanceToNow(new Date(profile.created_at), {
        locale: es,
      })}`
    : null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-ink">Mi perfil</h1>

      {/* Avatar + email */}
      <div className="card p-6 flex items-center gap-4">
        <div className="relative">
          <button
            onClick={handleAvatarClick}
            disabled={uploadingAvatar}
            className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 overflow-hidden relative group"
            title="Cambiar foto de perfil"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-medium text-accent">
                {initial}
              </span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploadingAvatar ? (
                <Loader2 size={18} className="text-white animate-spin" />
              ) : (
                <Camera size={18} className="text-white" />
              )}
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink">
            {profile?.display_name || "Sin nombre"}
          </p>
          <p className="text-sm text-ink-muted truncate">{user?.email}</p>
          {avatarError && (
            <p className="text-xs text-danger mt-1">{avatarError}</p>
          )}
        </div>
      </div>

      {/* Tarjetas destacadas: Miembro desde + Meta personal (separadas) */}
      <div
        className={`grid gap-4 ${
          profile?.personal_goal ? "sm:grid-cols-2" : ""
        }`}
      >
        {/* Miembro desde */}
        <div className="rounded-lg border border-surface-200 bg-white overflow-hidden text-center">
          <div className="bg-blue-600 py-3 flex items-center justify-center">
            <Calendar size={18} className="text-white" />
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">
              Miembro desde
            </p>
            <p className="text-xl font-semibold text-ink capitalize">
              {memberSince || "—"}
            </p>
            {timeSinceJoined && (
              <p className="text-xs text-ink-muted mt-1">{timeSinceJoined}</p>
            )}
          </div>
        </div>

        {/* Meta personal - solo si existe */}
        {profile?.personal_goal && (
          <div className="rounded-lg border border-surface-200 bg-white overflow-hidden text-center">
            <div className="bg-accent py-3 flex items-center justify-center">
              <Flag size={18} className="text-white" />
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">
                Mi meta personal
              </p>
              <p className="text-base text-ink font-medium leading-relaxed">
                {profile.personal_goal}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Display name + datos opcionales */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ink-soft uppercase tracking-wider">
            Información personal
          </h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="btn-ghost text-accent hover:bg-accent/10 py-1"
            >
              <Pencil size={13} /> Editar
            </button>
          )}
        </div>
        <div className="card p-4">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="label">Nombre para mostrar</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  autoFocus
                  maxLength={50}
                />
              </div>

              <div>
                <label className="label">
                  País{" "}
                  <span className="text-ink-muted font-normal">(opcional)</span>
                </label>
                <select
                  className="input"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="">Sin especificar</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-ink-muted mt-1">
                  Se usa para establecer tu zona horaria automáticamente.
                </p>
              </div>

              <div>
                <label className="label">
                  Fecha de nacimiento{" "}
                  <span className="text-ink-muted font-normal">(opcional)</span>
                </label>
                <input
                  type="date"
                  className="input"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={format(new Date(), "yyyy-MM-dd")}
                />
              </div>

              <div>
                <label className="label">
                  Meta personal{" "}
                  <span className="text-ink-muted font-normal">(opcional)</span>
                </label>
                <textarea
                  className="input resize-none"
                  rows={3}
                  value={personalGoal}
                  onChange={(e) => setPersonalGoal(e.target.value)}
                  placeholder="Ej: Quiero ser más disciplinado este año"
                  maxLength={200}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary"
                >
                  <Check size={14} /> {saving ? "Guardando..." : "Guardar"}
                </button>
                <button onClick={handleCancel} className="btn-ghost">
                  <X size={14} /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-ink-muted">Nombre</p>
                <p className="text-sm text-ink">
                  {profile?.display_name || "Sin configurar"}
                </p>
              </div>
              <div className="pt-3 border-t border-surface-100">
                <p className="text-xs text-ink-muted">País</p>
                <p className="text-sm text-ink">
                  {COUNTRIES.find((c) => c.code === profile?.country)?.name ||
                    "Sin especificar"}
                </p>
              </div>
              <div className="pt-3 border-t border-surface-100">
                <p className="text-xs text-ink-muted">Fecha de nacimiento</p>
                <p className="text-sm text-ink">
                  {profile?.birth_date
                    ? format(
                        new Date(profile.birth_date + "T00:00:00"),
                        "d 'de' MMMM 'de' yyyy",
                        { locale: es }
                      )
                    : "Sin especificar"}
                </p>
              </div>
              <div className="pt-3 border-t border-surface-100">
                <p className="text-xs text-ink-muted">Meta personal</p>
                <p className="text-sm text-ink">
                  {profile?.personal_goal || "Sin especificar"}
                </p>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-danger mt-2">{error}</p>}
          {success && !editing && (
            <p className="text-xs text-accent mt-2">{success}</p>
          )}
        </div>
      </section>
    </div>
  );
}
