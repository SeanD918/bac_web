import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Chatbot from './components/Chatbot'
import HomePage from './pages/HomePage'
import BrowsePage from './pages/BrowsePage'
import SectionsPage from './pages/SectionsPage'
import SectionPage from './pages/SectionPage'
import AboutPage from './pages/AboutPage'
import AdminPage from './pages/AdminPage'
import CalculatorPage from './pages/CalculatorPage'
import ViewerPage from './pages/ViewerPage'
import './App.css'

import AuthPage from './pages/AuthPage'
import CommunityPage from './pages/CommunityPage'
import MessagesPage from './pages/MessagesPage'

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/"             element={<HomePage />} />
          <Route path="/browse"       element={<BrowsePage />} />
          <Route path="/sections"     element={<SectionsPage />} />
          <Route path="/sections/:id" element={<SectionPage />} />
          <Route path="/view/:id"     element={<ViewerPage />} />
          <Route path="/calculator"   element={<CalculatorPage />} />
          <Route path="/about"        element={<AboutPage />} />
          <Route path="/admin"        element={<AdminPage />} />
          <Route path="/auth"         element={<AuthPage />} />
          <Route path="/community"    element={<CommunityPage />} />
          <Route path="/messages/:userId" element={<MessagesPage />} />
        </Routes>
      </main>
      <Chatbot />
      <Footer />
    </div>
  )
}

export default App
