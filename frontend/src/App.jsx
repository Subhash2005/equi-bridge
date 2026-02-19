import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import StudentRegister from './pages/student/StudentRegister'
import OrgListing from './pages/student/OrgListing'
import DreamPipeline from './pages/student/DreamPipeline'
import MonthlyProgress from './pages/student/MonthlyProgress'
import JobStatus from './pages/student/JobStatus'
import DailyLogin from './pages/daily/DailyLogin'
import NearbyWork from './pages/daily/NearbyWork'
import RevenueDashboard from './pages/daily/RevenueDashboard'
import AutoInvest from './pages/daily/AutoInvest'
import EmergencyRecover from './pages/daily/EmergencyRecover'
import DisabilityRegister from './pages/disability/DisabilityRegister'
import VacancyConnect from './pages/disability/VacancyConnect'
import ActiveWork from './pages/disability/ActiveWork'
import PostJob from './pages/disability/PostJob'
import RevenueCredit from './pages/disability/RevenueCredit'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <div className="animated-bg" />
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/student" element={<StudentRegister />} />
            <Route path="/student/org" element={<OrgListing />} />
            <Route path="/student/pipeline" element={<DreamPipeline />} />
            <Route path="/student/progress" element={<MonthlyProgress />} />
            <Route path="/student/job" element={<JobStatus />} />
            <Route path="/daily" element={<DailyLogin />} />
            <Route path="/daily/work" element={<NearbyWork />} />
            <Route path="/daily/revenue" element={<RevenueDashboard />} />
            <Route path="/daily/invest" element={<AutoInvest />} />
            <Route path="/daily/recover" element={<EmergencyRecover />} />
            <Route path="/disability" element={<DisabilityRegister />} />
            <Route path="/disability/jobs" element={<VacancyConnect />} />
            <Route path="/disability/active" element={<ActiveWork />} />
            <Route path="/disability/post" element={<PostJob />} />
            <Route path="/disability/pay" element={<RevenueCredit />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
