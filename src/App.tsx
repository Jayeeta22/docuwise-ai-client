import { Flex, Spin } from "antd";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import { DashboardPage } from "../src/pages/DashboardPage";
import { DocumentDetailPage } from "../src/pages/DocumentDetailPage";
import DocumentsPage from "../src/pages/DocumentsPage";
import { useI18n } from "../src/i18n";
import { LoginPage } from "../src/pages/LoginPage";
import { RegisterPage } from "../src/pages/RegisterPage";
import { useDispatch } from "react-redux";
import { apiSlice, useGetMeQuery, useLogoutMutation } from "./store/apiSlice";
import type { AuthUser } from "./types/auth";
import type { AppDispatch } from "./store/store";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";
  const isDocumentsRoute = location.pathname === "/documents" || location.pathname.startsWith("/documents/");
  const { data: meData, isLoading: isMeLoading, isFetching: isMeFetching } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const { t } = useI18n();

  // Prefer cached user after login/register patches. Do not gate on isError alone—initial /me 401
  // can leave isError true until refetch even after updateQueryData fills the cache.
  const authUser: AuthUser | null = meData?.user ?? null;

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      dispatch(apiSlice.util.resetApiState());
      navigate("/login", { replace: true });
    }
  };

  if (isMeLoading || isMeFetching) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Spin size="large" tip="Loading session…" />
      </Flex>
    );
  }

  return (
    <div className={`app-shell${isAuthRoute ? " app-shell--auth" : ""}`}>
      {!isAuthRoute ? (
        <header className="topbar">
          <Link to="/" className="brand">
            DocLens AI
          </Link>
          <nav>
            <Link to="/dashboard">{t("nav.dashboard")}</Link>
            {authUser ? <Link to="/documents">{t("nav.documents")}</Link> : null}
            {authUser ? (
              <button type="button" onClick={handleLogout} disabled={isLogoutLoading}>
                {isLogoutLoading ? t("nav.signingOut") : t("nav.logout")}
              </button>
            ) : (
              <>
                <Link to="/login">{t("nav.login")}</Link>
                <Link to="/register">{t("nav.register")}</Link>
              </>
            )}
          </nav>
        </header>
      ) : null}

      <main className={isAuthRoute ? "main main--auth" : `container${isDocumentsRoute ? " container--wide" : ""}`}>
        <Routes>
          <Route
            path="/"
            element={authUser ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/dashboard"
            element={authUser ? <DashboardPage user={authUser} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/documents"
            element={authUser ? <DocumentsPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/documents/:id"
            element={authUser ? <DocumentDetailPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={authUser ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={authUser ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
          />
          <Route path="*" element={<Navigate to={authUser ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
