import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import { Provider } from 'react-redux'
import store from './store/index.ts'
import { BrowserRouter } from 'react-router'
import { ToastContainer } from 'react-toastify'

const App = lazy(() => import('./App.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <Suspense fallback={<div>Loading...</div>}>
          <App />
          <ToastContainer
            position='top-center'
            hideProgressBar={true}
            newestOnTop={false}
            closeButton={false}
          />
        </Suspense>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)
