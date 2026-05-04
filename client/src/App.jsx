import AppRoutes from "./routes/AppRoutes";
import InstallPrompt from "./components/pwa/InstallPrompt";

function App() {
  return (
    <>
      <AppRoutes />
      <InstallPrompt />
    </>
  );
}

export default App;