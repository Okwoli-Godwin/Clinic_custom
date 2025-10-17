import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ClinicProfile } from "./page/clinic-profile"
import { AppDownloadBanner } from "./components/app-download-banner"
import { NotFound } from "./page/not-found"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <ClinicProfile />
              <AppDownloadBanner />
            </div>
          }
        />

        <Route path="/not-found" element={<NotFound />} />

        <Route
          path="/:clinicSlug"
          element={
            <div>
              <ClinicProfile />
              <AppDownloadBanner />
            </div>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
