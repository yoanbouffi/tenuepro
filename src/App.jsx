import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Packs from './pages/Packs'
import Realisations from './pages/Realisations'
import Devis from './pages/Devis'
import CGV from './pages/CGV'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/packs" element={<Packs />} />
            <Route path="/realisations" element={<Realisations />} />
            <Route path="/devis" element={<Devis />} />
            <Route path="/cgv" element={<CGV />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
