import { Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/dash";
import Home from "./pages/Home";
import Header from "./components/Header";

function App() {
  return (
    <AuthContextProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="auth" element={<Auth />} />
        <Route path="dash" element={<Dashboard />} />
      </Routes>
    </AuthContextProvider>
  );
}

export default App;
