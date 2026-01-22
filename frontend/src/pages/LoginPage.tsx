import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, ArrowRight, Zap, Shield, Target } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button, Input, ThemeToggle, Logo } from "../components/UI";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Ошибка входа");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Левая часть - Графика */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12 mesh-gradient">
        {/* Декоративные элементы */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#5c6cf2]/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#f43f5e]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#06b6d4]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Floating орбы */}
        <div className="absolute top-32 right-32 w-4 h-4 bg-gradient-to-br from-[#5c6cf2] to-[#7a8ff8] rounded-full animate-float shadow-lg shadow-[#5c6cf2]/50" />
        <div className="absolute bottom-40 left-40 w-3 h-3 bg-gradient-to-br from-[#f43f5e] to-[#fb7185] rounded-full animate-float shadow-lg shadow-[#f43f5e]/50" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-20 w-2 h-2 bg-gradient-to-br from-[#06b6d4] to-[#22d3ee] rounded-full animate-float shadow-lg shadow-[#06b6d4]/50" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-lg">
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-5xl font-bold mb-6 leading-tight text-slate-900 dark:text-white">
            Умное управление<br />
            <span className="gradient-text">вашими задачами</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-10">
            Превратите хаос в порядок. Планируйте, делегируйте и достигайте целей быстрее с AI-ассистентом.
          </p>

          {/* Фичи */}
          <div className="space-y-4">
            {[
              { icon: Zap, text: "Мгновенная организация задач", color: "from-amber-400 to-orange-500" },
              { icon: Shield, text: "Безопасность данных", color: "from-emerald-400 to-teal-500" },
              { icon: Target, text: "Фокус на важном", color: "from-[#5c6cf2] to-[#7a8ff8]" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm border border-white/40 dark:border-slate-700/40">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-200">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Правая часть - Форма */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Фоновый градиент */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#5c6cf2]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f43f5e]/5 rounded-full blur-3xl" />

        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle />
        </div>

        <div className="relative w-full max-w-md">
          {/* Лого для мобильной версии */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Logo size="lg" />
            <span className="text-2xl font-bold gradient-text">AI To-Do</span>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-700/50">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">С возвращением!</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Войдите, чтобы продолжить работу</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm rounded-xl border border-rose-200 dark:border-rose-800/50 flex items-center gap-2 animate-slideUp">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />
              <div className="space-y-1">
                <Input
                  label="Пароль"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <div className="flex justify-end">
                  <a href="#" className="text-xs font-medium text-[#5c6cf2] hover:text-[#4f4de6] dark:text-[#7a8ff8] dark:hover:text-[#5c6cf2] transition-colors">
                    Забыли пароль?
                  </a>
                </div>
              </div>

              <Button type="submit" className="w-full py-3.5" disabled={loading}>
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Вход...
                  </>
                ) : (
                  <>
                    Войти <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                Нет аккаунта?{" "}
                <Link to="/register" className="font-semibold text-[#5c6cf2] hover:text-[#4f4de6] dark:text-[#7a8ff8] dark:hover:text-[#5c6cf2] transition-colors">
                  Создать бесплатно →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};