import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AdminUX } from './pages/AdminUX'
import { ChoresKiosk } from './pages/ChoresKiosk'
import { HelpCenter } from './pages/HelpCenter'
import { UIBuilder } from './pages/UIBuilder'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<AdminUX />} />
          <Route path="chores" element={<ChoresKiosk />} />
          <Route path="builder" element={<UIBuilder />} />
          <Route path="help" element={<HelpCenter />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
