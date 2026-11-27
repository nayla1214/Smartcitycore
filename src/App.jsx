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
import PlatformInfo from './pages/PlatformInfo';

import AdminDashboard, {
  AdminAccount,
} from './pages/AdminDashboard';

import TeacherDashboard, {
  TeacherAccount,
} from './pages/TeacherDashboard';

import {
  TeacherTracking,
  TeacherForums,
} from './pages/TeacherSupport';

import AdminCourses from './pages/AdminCourses';
import AdminSurveys from './pages/AdminSurveys';

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

const getRoleHome = (role) => {
  if (['ADMIN', 'SUPERADMIN'].includes(role)) {
    return '/admin';
  }

  if (role === 'DOCENTE') {
    return '/docente';
  }

  if (role === 'USER') {
    return '/dashboard';
  }

  return '/';
};

const RoleRoute = ({ roles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return roles.includes(user.role)
    ? <Outlet />
    : (
      <Navigate
        to={getRoleHome(user.role)}
        replace
      />
    );
};

const AccountPage = () => {
  const { user } = useContext(AuthContext);

  if (
    ['ADMIN', 'SUPERADMIN'].includes(user?.role)
  ) {
    return <AdminAccount />;
  }

  if (user?.role === 'DOCENTE') {
    return <TeacherAccount />;
  }

  return <Profile />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Páginas públicas */}

          <Route index element={<Home />} />

          <Route
            path="plataforma"
            element={<PlatformInfo />}
          />

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
            {/* Administración */}

            <Route
              element={
                <RoleRoute
                  roles={['ADMIN', 'SUPERADMIN']}
                />
              }
            >
              <Route
                path="admin"
                element={<AdminDashboard />}
              />

              <Route
                path="admin/users"
                element={<AdminDashboard />}
              />

              {/* Exclusivo del administrador tutor */}

              <Route
                element={
                  <RoleRoute roles={['ADMIN']} />
                }
              >
                <Route
                  path="admin/courses"
                  element={<AdminCourses />}
                />

                <Route
                  path="admin/surveys"
                  element={<AdminSurveys />}
                />
              </Route>
            </Route>

            {/* Docentes */}

            <Route
              element={
                <RoleRoute roles={['DOCENTE']} />
              }
            >
              <Route
                path="docente"
                element={<TeacherDashboard />}
              />

              <Route
                path="docente/seguimiento"
                element={<TeacherTracking />}
              />

              <Route
                path="docente/foros"
                element={<TeacherForums />}
              />
            </Route>

            {/* Participantes */}

            <Route
              element={
                <RoleRoute roles={['USER']} />
              }
            >
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
                element={
                  <ModuleIntegrativeEvaluation />
                }
              />

              <Route
                path="module/2/integrative-evaluation"
                element={
                  <Module2IntegrativeEvaluation />
                }
              />

              <Route
                path="module/3/integrative-evaluation"
                element={
                  <Module3IntegrativeEvaluation />
                }
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

            {/* Perfil según el rol */}

            <Route
              path="profile"
              element={<AccountPage />}
            />
          </Route>

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;