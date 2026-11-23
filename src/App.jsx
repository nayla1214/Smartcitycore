import { useContext } from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';

import { AuthContext } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GadDetail from './pages/GadDetail';
import Dashboard from './pages/Dashboard';

import AdminDashboard, {
  AdminAccount,
} from './pages/AdminDashboard';

import AdminCourses from './pages/AdminCourses';

import CourseDetail from './pages/CourseDetail';
import ModuleDetail from './pages/ModuleDetail';
import Profile from './pages/Profile';
import Progress from './pages/Progress';
import Notifications from './pages/Notifications';
import TopicPage from './pages/TopicPage';

import MainLayout from './layouts/MainLayout';
import PrivateRoute from './components/PrivateRoute';

import ModuleIntegrativeEvaluation from './pages/ModuleIntegrativeEvaluation';
import Module2IntegrativeEvaluation from './pages/Module2IntegrativeEvaluation';
import Module3IntegrativeEvaluation from './pages/Module3IntegrativeEvaluation';

const ManagementRoute = () => {
  const { user } = useContext(AuthContext);

  return ['ADMIN', 'SUPERADMIN'].includes(user?.role)
    ? <Outlet />
    : <Navigate to="/dashboard" replace />;
};

const CourseAdminRoute = () => {
  const { user } = useContext(AuthContext);

  return user?.role === 'ADMIN'
    ? <Outlet />
    : <Navigate to="/admin" replace />;
};

const ParticipantRoute = () => {
  const { user } = useContext(AuthContext);

  return user?.role === 'USER'
    ? <Outlet />
    : <Navigate to="/admin" replace />;
};

const AccountPage = () => {
  const { user } = useContext(AuthContext);

  return ['ADMIN', 'SUPERADMIN'].includes(user?.role)
    ? <AdminAccount />
    : <Profile />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />

          <Route
            path="login"
            element={<Login />}
          />

          <Route
            path="register"
            element={<Register />}
          />

          <Route
            path="gad/:name"
            element={<GadDetail />}
          />

          <Route element={<PrivateRoute />}>
            <Route element={<ManagementRoute />}>
              <Route
                path="admin"
                element={<AdminDashboard />}
              />

              <Route
                path="admin/users"
                element={<AdminDashboard />}
              />

              <Route element={<CourseAdminRoute />}>
                <Route
                  path="admin/courses"
                  element={<AdminCourses />}
                />
              </Route>
            </Route>

            <Route element={<ParticipantRoute />}>
              <Route
                path="dashboard"
                element={<Dashboard />}
              />

              <Route
                path="progress"
                element={<Progress />}
              />

              <Route
                path="notifications"
                element={<Notifications />}
              />

              <Route
                path="course/:courseId"
                element={<CourseDetail />}
              />

              <Route
                path="module/1/integrative-evaluation"
                element={<ModuleIntegrativeEvaluation />}
              />

              <Route
                path="module/2/integrative-evaluation"
                element={<Module2IntegrativeEvaluation />}
              />

              <Route
                path="module/3/integrative-evaluation"
                element={<Module3IntegrativeEvaluation />}
              />

              <Route
                path="module/:moduleId"
                element={<ModuleDetail />}
              />

              <Route
                path="module/:moduleId/topic/:topicNumber"
                element={<TopicPage />}
              />
            </Route>

            <Route
              path="profile"
              element={<AccountPage />}
            />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;