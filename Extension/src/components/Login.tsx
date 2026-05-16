import { useState, type FormEvent } from "react";
import { authService } from "../services/api";

interface LoginProps {
  onSuccess: (
    user: { id?: string; email?: string; username?: string } | null,
  ) => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        email: email.trim(),
        password: password.trim(),
        username: username.trim(),
      };

      const result =
        mode === "login"
          ? await authService.login(payload)
          : await authService.register(payload);

      if (result && result.token) {
        onSuccess(result.user ?? null);
      } else {
        setError("Không thể xác thực, vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Auth error:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(
        message ||
          "Đăng nhập/đăng ký không thành công. Vui lòng kiểm tra lại thông tin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[280px] w-full bg-slate-50 flex items-center justify-center px-0 py-0">
      <div className="w-full max-w-[280px] rounded-2xl border border-slate-200 bg-white p-2 shadow-sm h-full flex flex-col justify-between">
        <div className="text-center">
          <h1 className="text-base font-semibold text-slate-900">
            JP ChatBuddy
          </h1>
          <p className="mt-0.5 text-[10px] text-slate-500">
            {mode === "login" ? "Đăng nhập để tiếp tục" : "Tạo tài khoản mới"}
          </p>
        </div>

        <div className="flex gap-2 rounded-full bg-slate-100 p-[2px]">
          <button
            type="button"
            className={`flex-1 rounded-full py-1 text-[12px] font-semibold transition ${
              mode === "login"
                ? "bg-white text-slate-900 shadow"
                : "text-slate-500 hover:text-slate-900"
            }`}
            onClick={() => {
              setMode("login");
              resetForm();
            }}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={`flex-1 rounded-full py-1 text-[12px] font-semibold transition ${
              mode === "register"
                ? "bg-white text-slate-900 shadow"
                : "text-slate-500 hover:text-slate-900"
            }`}
            onClick={() => {
              setMode("register");
              resetForm();
            }}
          >
            Đăng ký
          </button>
        </div>

        <form
          className="space-y-2 flex-1 flex flex-col justify-center"
          onSubmit={handleSubmit}
        >
          {mode === "register" && (
            <label className="block text-[11px] text-slate-700">
              Tên người dùng
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-900 outline-none focus:border-slate-400"
                placeholder="Tên hiển thị"
                required
              />
            </label>
          )}

          <label className="block text-[11px] text-slate-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-900 outline-none focus:border-slate-400"
              placeholder="example@mail.com"
              required
            />
          </label>

          <label className="block text-[11px] text-slate-700">
            Mật khẩu
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-900 outline-none focus:border-slate-400"
              placeholder="Mật khẩu"
              required
            />
          </label>

          {error && (
            <div className="rounded-2xl bg-rose-50 px-2 py-1 text-[10px] text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70 mt-2"
          >
            {loading
              ? "Đang xử lý..."
              : mode === "login"
                ? "Đăng nhập"
                : "Đăng ký"}
          </button>
        </form>

        <div className="mt-2 text-center text-[10px] text-slate-500">
          {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              resetForm();
            }}
            className="font-medium text-slate-900 hover:underline"
          >
            {mode === "login" ? "Đăng ký" : "Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
