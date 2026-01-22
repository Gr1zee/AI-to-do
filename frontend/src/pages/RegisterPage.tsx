import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, ArrowRight, CheckCircle, Sparkles, Rocket, Zap, BarChart3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button, Input, ThemeToggle, Logo } from "../components/UI";

export const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return;
    }

    try {
      await register(email, name, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Ошибка регистрации");
    }
  };

  const features = [
    { icon: Sparkles, text: "Умное планирование задач с AI", color: "from-[#5c6cf2] to-[#7a8ff8]" },
    { icon: Rocket, text: "Организация проектов и дедлайнов", color: "from-rose-500 to-pink-500" },
    { icon: BarChart3, text: "Аналитика продуктивности", color: "from-cyan-500 to-blue-500" },
    { icon: Zap, text: "Бесплатно навсегда", color: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Левая часть - Графика */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12 mesh-gradient">
        {/* Декоративные элементы */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#f43f5e]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#5c6cf2]/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-[#06b6d4]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Floating орбы */}
        <div className="absolute top-40 left-32 w-4 h-4 bg-gradient-to-br from-[#f43f5e] to-[#fb7185] rounded-full animate-float shadow-lg shadow-[#f43f5e]/50" />
        <div className="absolute bottom-32 right-40 w-3 h-3 bg-gradient-to-br from-[#5c6cf2] to-[#7a8ff8] rounded-full animate-float shadow-lg shadow-[#5c6cf2]/50" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-20 w-2 h-2 bg-gradient-to-br from-[#06b6d4] to-[#22d3ee] rounded-full animate-float shadow-lg shadow-[#06b6d4]/50" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-lg">
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <Rocket className="w-10 h-10 text-[#5c6cf2] dark:text-white" />
          </div>

          <h1 className="text-5xl font-bold mb-6 leading-tight text-slate-900 dark:text-white">
            Начните свой путь к<br />
            <span className="gradient-text">продуктивности</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-10">
            Присоединяйтесь к тысячам пользователей, которые уже управляют своими задачами эффективнее.
          </p>

          {/* Список преимуществ */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 animate-slideUp" style={{ animationDelay: `${0.1 * index}s` }}>
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
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#f43f5e]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#5c6cf2]/5 rounded-full blur-3xl" />

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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                Создайте аккаунт <Sparkles className="w-6 h-6 text-amber-500" />
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Заполните данные для регистрации</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm rounded-xl border border-rose-200 dark:border-rose-800/50 flex items-center gap-2 animate-slideUp">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Имя"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван Иванов"
                required
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />
              <Input
                label="Пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Input
                label="Подтвердите пароль"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <Button type="submit" variant="gradient" className="w-full py-3.5" disabled={loading}>
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    Создать аккаунт <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                Уже есть аккаунт?{" "}
                <Link to="/login" className="font-semibold text-[#5c6cf2] hover:text-[#4f4de6] dark:text-[#7a8ff8] dark:hover:text-[#5c6cf2] transition-colors">
                  Войти →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
