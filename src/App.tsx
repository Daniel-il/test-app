import { Link, Route, Routes } from 'react-router-dom'
import './App.scss'


import Users from './pages/Users/Users'
import UserDetails from './pages/UserDetails/UserDetails'

function App() {
  return (
    <div id="root">
      <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Link to="/users">Пользователи</Link>
      </nav>
      <Routes>
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserDetails />} />
      </Routes>
    </div>
  )
}

export default App
