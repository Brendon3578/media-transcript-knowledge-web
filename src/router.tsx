import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import UploadPage from "./pages/UploadPage";
import LibraryPage from "./pages/LibraryPage";
import SearchPage from "./pages/SearchPage";
import MediaPage from "./pages/MediaPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/library" replace />,
      },
      {
        path: "upload",
        element: <UploadPage />,
      },
      {
        path: "library",
        element: <LibraryPage />,
      },
      {
        path: "media/:id",
        element: <MediaPage />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
    ],
  },
]);
