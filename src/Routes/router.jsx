// src/router/router.jsx
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../Layouts/MainLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Register from "../pages/Register";
import ProtectedRoute from "../components/ProtectedRoute";

import AllIssues from "../pages/All_Issues";
import AddIssue from "../pages/Add_Issue";
import MyIssues from "../pages/My_Issues";
import MyContribution from "../pages/My_Contribution";
import IssueDetails from "../pages/IssueDetails";
import NotFound from "../pages/NotFound"; // ✅ make sure you imported this

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },

      // public pages
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/register", element: <Register /> },
      { path: "/issues", element: <AllIssues /> },
      { path: "/issues/:id", element: <IssueDetails /> },

      // protected routes
      {
        path: "/add-issue",
        element: (
          <ProtectedRoute>
            <AddIssue />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-issues",
        element: (
          <ProtectedRoute>
            <MyIssues />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-contribution",
        element: (
          <ProtectedRoute>
            <MyContribution />
          </ProtectedRoute>
        ),
      },

      // ✅ Keep 404 at the very bottom
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
