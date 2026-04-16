import { AuthProvider } from "./AuthContext";
import { DataProvider } from "./DataContext";
import { UIProvider } from "./UIContext";

function AppProviders({ children }) {
  return (
    <DataProvider>
      <AuthProvider>
        <UIProvider>{children}</UIProvider>
      </AuthProvider>
    </DataProvider>
  );
}

export default AppProviders;
