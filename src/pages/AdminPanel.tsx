import { useState, useEffect } from "react";
import { Calendar, User, Package, MapPin, Trash2, RefreshCw, Download, Lock, Eye, EyeOff } from "lucide-react";
import {
  Booking,
  loadBookings,
  saveBookings,
  formatHour,
  SCHEDULE_STORAGE_KEY,
} from "@/constants/schedule";

const ADMIN_PASSWORD = "GoTechsv123";
const SECURITY_QUESTION = "¿Quién es el dueño de GoTech?";
const SECURITY_ANSWER = "kevin alessandro";

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [step, setStep] = useState<"password" | "question">("password");
  const [password, setPassword] = useState("");
  const [answer, setAnswer] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<"all" | "today" | "upcoming">("all");

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setStep("question");
      setError("");
    } else {
      setError("Contraseña incorrecta.");
    }
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim().toLowerCase() === SECURITY_ANSWER) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Respuesta incorrecta.");
    }
  };

  if (!authenticated) {
    return (
      <div className="pt-16 min-h-screen section-grid flex items-center justify-center">
        <div className="w-full max-w-sm mx-4">
          <div className="card-tech p-8 border border-neon-cyan/30">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 mx-auto mb-5">
              <Lock className="w-7 h-7 text-neon-cyan" />
            </div>
            <h1 className="font-orbitron font-black text-xl text-white text-center mb-1">Acceso Admin</h1>
            <p className="text-white/30 text-xs text-center mb-6">GoTech Panel de Control</p>

            {step === "password" ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-neon-cyan/50 pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                <button type="submit" className="btn-neon w-full py-3 text-sm">Continuar</button>
              </form>
            ) : (
              <form onSubmit={handleAnswerSubmit} className="space-y-4">
                <p className="text-white/60 text-sm text-center mb-2">{SECURITY_QUESTION}</p>
                <input
                  type="text"
                  placeholder="Tu respuesta"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full bg-dark-700 border border-neon-cyan/20 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-neon-cyan/50"
                  autoFocus
                />
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                <button type="submit" className="btn-neon w-full py-3 text-sm">Acceder</button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  const refresh = () => setBookings(loadBookings());

  useEffect(() => {
    refresh();
  }, []);

  const deleteBooking = (id: string) => {
    const updated = bookings.filter((b) => b.id !== id);
    saveBookings(updated);
    setBookings(updated);
  };

  const clearAll = () => {
    if (window.confirm("¿Seguro que querés borrar TODAS las reservas?")) {
      saveBookings([]);
      setBookings([]);
    }
  };

  const todayStr = new Date().toLocaleDateString("es-SV", { weekday: "long", day: "numeric", month: "long" });

  const filtered = bookings.filter((b) => {
    if (filter === "today") return b.date === todayStr;
    if (filter === "upcoming") return new Date(b.createdAt) >= new Date(Date.now() - 86400000);
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const exportCSV = () => {
    const headers = ["ID", "Fecha", "Hora", "Nombre", "Producto", "Punto de Entrega", "Teléfono", "Creado"];
    const rows = bookings.map((b) => [
      b.id, b.date, b.time, b.name, b.product, b.deliveryPoint, b.phone || "", b.createdAt,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gotech-entregas-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="pt-16 min-h-screen section-grid">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-neon-cyan" />
              <h1 className="font-orbitron font-black text-2xl text-white">
                Panel de <span className="text-neon-cyan">Entregas</span>
              </h1>
            </div>
            <p className="text-white/40 text-sm">{bookings.length} entrega{bookings.length !== 1 ? "s" : ""} programada{bookings.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={refresh} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neon-cyan/20 text-neon-cyan/70 hover:border-neon-cyan/60 hover:text-neon-cyan text-xs font-bold transition-all">
              <RefreshCw className="w-3.5 h-3.5" /> Actualizar
            </button>
            <button onClick={exportCSV} disabled={bookings.length === 0} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neon-cyan/20 text-neon-cyan/70 hover:border-neon-cyan/60 hover:text-neon-cyan text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </button>
            {bookings.length > 0 && (
              <button onClick={clearAll} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/20 text-red-400/70 hover:border-red-500/60 hover:text-red-400 text-xs font-bold transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Borrar todo
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: bookings.length, color: "text-neon-cyan" },
            { label: "Hoy", value: bookings.filter((b) => b.date === todayStr).length, color: "text-green-400" },
            { label: "Esta semana", value: bookings.filter((b) => new Date(b.createdAt) >= new Date(Date.now() - 7 * 86400000)).length, color: "text-orange-400" },
            { label: "Puntos únicos", value: new Set(bookings.map((b) => b.deliveryPoint)).size, color: "text-purple-400" },
          ].map((stat) => (
            <div key={stat.label} className="card-tech p-4 text-center">
              <p className={`font-orbitron font-black text-3xl ${stat.color} glow-text`}>{stat.value}</p>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "today", "upcoming"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                filter === f
                  ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                  : "border-white/10 text-white/40 hover:border-neon-cyan/30 hover:text-white/60"
              }`}
            >
              {f === "all" ? "Todas" : f === "today" ? "Hoy" : "Recientes"}
            </button>
          ))}
        </div>

        {/* Bookings list */}
        {filtered.length === 0 ? (
          <div className="card-tech p-12 text-center">
            <Calendar className="w-12 h-12 text-neon-cyan/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">
              {filter === "today" ? "No hay entregas para hoy." : "No hay entregas programadas aún."}
            </p>
            <p className="text-white/20 text-xs mt-1">Los clientes verán el calendario en la página de inicio.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((booking) => (
              <div key={booking.id} className="card-tech p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Date/time badge */}
                <div className="shrink-0 bg-neon-cyan/10 border border-neon-cyan/20 rounded-xl px-4 py-3 text-center min-w-[100px]">
                  <p className="font-orbitron font-black text-neon-cyan text-sm leading-tight">{booking.time}</p>
                  <p className="text-white/40 text-[10px] mt-0.5 leading-tight">{booking.date.split(" ").slice(0, 2).join(" ")}</p>
                </div>

                {/* Details */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-neon-cyan/50 shrink-0" />
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Cliente</p>
                      <p className="text-white text-sm font-semibold">{booking.name}</p>
                      {booking.phone && <p className="text-white/40 text-[11px]">{booking.phone}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-neon-cyan/50 shrink-0" />
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Producto</p>
                      <p className="text-white text-sm font-semibold leading-snug">{booking.product}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-neon-cyan/50 shrink-0" />
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Punto</p>
                      <p className="text-white text-xs font-semibold leading-snug">{booking.deliveryPoint}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-white/20 text-[10px] font-mono">{booking.id}</span>
                  <button
                    onClick={() => deleteBooking(booking.id)}
                    className="w-7 h-7 rounded-lg border border-red-500/20 text-red-400/50 hover:border-red-500/60 hover:text-red-400 flex items-center justify-center transition-all"
                    title="Eliminar reserva"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-white/15 text-[10px] text-center mt-8">
          Panel Admin GoTech · Los datos se almacenan localmente en este navegador
        </p>
      </div>
    </div>
  );
}
