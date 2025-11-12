// src/router/router.jsx
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../Layouts/MainLayout";
import Home from "../pages/Home";
import Services from "../pages/Services"; // যদি ব্যবহার করি
import Profile from "../pages/Profile";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Register from "../pages/Register";
import ServiceDetails from "../pages/ServiceDetails"; // service detail if exist

import ProtectedRoute from "../components/ProtectedRoute";

// **IMPORTANT**: Import the real pages you made for issues
import AllIssues from "../pages/All_Issues";        // src/pages/All_Issues.jsx
import AddIssue from "../pages/Add_Issue";         // src/pages/Add_Issue.jsx (private)
import MyIssues from "../pages/My_Issues";        // src/pages/My_Issues.jsx (private)
import MyContribution from "../pages/My_Contribution"; // src/pages/My_Contribution.jsx (private)
import IssueDetails from "../pages/IssueDetails";  // src/pages/IssueDetails.jsx

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },

      // public pages
      { path: "/services", element: <Services /> },
      { path: "/profile", element: <Profile /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/register", element: <Register /> },
      { path: "/issues", element: <AllIssues /> },              // All Issues page (public)
      { path: "/issues/:id", element: <IssueDetails /> },      // Issue details (you can wrap with ProtectedRoute if needed)

      // protected routes (only for logged-in users)
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

      // service detail example (if you use a different detail route)
      {
        path: "/service/:id",
        element: (
          <ProtectedRoute>
            <ServiceDetails />
          </ProtectedRoute>
        ),
      },

      // fallback handled in MainLayout (or add 404 route)
    ],
  },
]);

export default router;
