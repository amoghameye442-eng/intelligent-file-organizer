import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import Search from "./pages/Search"
import Rules from "./pages/Rules"
import History from "./pages/History"
import Settings from "./pages/Settings"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="search" element={<Search />} />
          <Route path="rules" element={<Rules />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App