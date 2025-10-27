import React from "react";
import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import PageLoader from "./components/PageLoader.jsx";

import useAuthUser from "./hooks/useAuthUser.js";

const App = () => {
  console.log("running hook useAuthUser");
  const { isLoading, authUser } = useAuthUser();
  console.log("authUser---------->", authUser);

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded || false;
  console.log("isOnboarded ---->", isOnboarded);
  console.log("isAuthenticated ---->", isAuthenticated);

  // const authUser = authData?.user;
  console.log("auth user data ---->", authUser);
  // console.log("isLoading ---->", isLoading);
  // console.log("Error ---->", error);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className=" h-screen" data-theme="dark">
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated && isOnboarded ? (
              <HomePage />
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/signup"
          element={!isAuthenticated ? <SignupPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/notifications"
          element={
            isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/call"
          element={isAuthenticated ? <CallPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat"
          element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/onboarding"
          element={
            isAuthenticated ? <OnboardingPage /> : <Navigate to="/login" />
          }
        />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
