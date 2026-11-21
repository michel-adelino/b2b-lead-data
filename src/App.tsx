import { Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import { useDemo } from './state/demo'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { Companies } from './pages/Companies'
import { CompanyDetail } from './pages/Company'
import { Contacts } from './pages/Contacts'
import { ImportPage } from './pages/Import'
import { Lists } from './pages/Lists'
import { ListDetail } from './pages/ListDetail'
import { Wallet } from './pages/Wallet'
import { Billing } from './pages/Billing'
import { Settings } from './pages/Settings'
import { Hubspot } from './pages/Hubspot'
import { Mcp } from './pages/Mcp'
import { Admin } from './pages/Admin'

function Gate() {
  const { signedIn } = useDemo()
  if (!signedIn) return <Navigate to="/login" replace />
  return <Shell />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Gate />}>
        <Route path="/" element={<Home />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:cvr" element={<CompanyDetail />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/lists" element={<Lists />} />
        <Route path="/lists/:id" element={<ListDetail />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/hubspot" element={<Hubspot />} />
        <Route path="/mcp" element={<Mcp />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
