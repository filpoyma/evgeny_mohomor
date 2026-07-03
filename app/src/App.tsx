import { Suspense } from "react";
import AppNavigation from "./app/routing/AppNavigation.tsx";
import SpinnerLoader from "./shared/components/Loaders/SpinnerLoader.tsx";

const App = () => {
  return (
    <Suspense fallback={<SpinnerLoader />}>
      <AppNavigation />
    </Suspense>
  );
};

export default App;
