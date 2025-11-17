import { Navigate, Route, Routes } from "react-router"
import SignUp from "./pages/auth/SignUp"
import LogIn from "./pages/auth/LogIn"


function App() {

  return (
    <>
      <Routes>

        <Route path='/auth'>
          <Route index element={<Navigate to="/auth/login" />} />
          <Route path="login" element={<LogIn />} />
          <Route path="sign-up" element={<SignUp />} />
        </Route>

        <Route >
          <Route path="/" element={<h1>Home</h1>} />
        </Route>
      </Routes>
    </>
  )
}

export default App
