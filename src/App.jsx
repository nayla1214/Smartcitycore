import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GadDetail from './pages/GadDetail';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CourseDetail from './pages/CourseDetail';
import ModuleDetail from './pages/ModuleDetail';
import Profile from './pages/Profile';
import MainLayout from './layouts/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import Progress from './pages/Progress';
import TopicDetail from './pages/TopicDetail';
import ModuleIntegrativeEvaluation from './pages/ModuleIntegrativeEvaluation';
import Module2IntegrativeEvaluation from './pages/Module2IntegrativeEvaluation';
import Module3IntegrativeEvaluation from './pages/Module3IntegrativeEvaluation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="gad/:name" element={<GadDetail />} />
          <Route element={<PrivateRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="progress" element={<Progress />} />
            <Route path="course/:courseId" element={<CourseDetail />} />
            <Route path="module/1/integrative-evaluation" element={<ModuleIntegrativeEvaluation />} />
            <Route path="module/2/integrative-evaluation" element={<Module2IntegrativeEvaluation />} />
            <Route path="module/3/integrative-evaluation" element={<Module3IntegrativeEvaluation />} />
            <Route path="module/:moduleId" element={<ModuleDetail />} />
            <Route path="module/:moduleId/topic/:topicNumber" element={<TopicDetail />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
