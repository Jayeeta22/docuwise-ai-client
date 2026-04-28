import { Flex, Spin } from "antd";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { DashboardPage } from "../src/pages/DashboardPage";
import { HomePage } from "../src/pages/HomePage";
import { LoginPage } from "../src/pages/LoginPage";
import { RegisterPage } from "../src/pages/RegisterPage";
import { useGetMeQuery, useLogoutMutation } from "./store/apiSlice";
import type { AuthUser } from "./types/auth";

function App() {
  const location = useLocation();
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";
  const { data: meData, isLoading: isMeLoading, isError: isMeError } = useGetMeQuery();
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();

  const authUser: AuthUser | null = isMeError ? null : (meData?.user ?? null);

  const handleLogout = () => {
    void logout();
  };

  if (isMeLoading) {
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
            <Link to="/dashboard">Dashboard</Link>
            {authUser ? (
              <button type="button" onClick={handleLogout} disabled={isLogoutLoading}>
                {isLogoutLoading ? "Signing out…" : "Logout"}
              </button>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </nav>
        </header>
      ) : null}

      <main className={isAuthRoute ? "main main--auth" : "container"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/dashboard"
            element={authUser ? <DashboardPage user={authUser} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={authUser ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={authUser ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
