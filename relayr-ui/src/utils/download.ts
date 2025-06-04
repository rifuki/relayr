// External Libraries
import axios, { AxiosProgressEvent } from "axios";

// Prepares a dummy file for download, showing progress if necessary
export async function handlePrepareDummyFile(
  setIsFileLoading: (isFileLoading: boolean) => void,
  setFile: (file: File) => void,
  setProgress?: (progress: number) => void,
) {
  setIsFileLoading(true);

  const url = "/api/download/dummy-file"; // URL for the dummy file
  const fileName = url.split("/").pop() || "download-file"; // Extract file name from URL

  const controller = new AbortController();
  const response = await axios.get(url, {
    responseType: "blob", // Get file as Blob
    signal: controller.signal,
    onDownloadProgress: (progress: AxiosProgressEvent) => {
      const { loaded, total } = progress;
      if (total && setProgress) {
        const percent = Math.round((loaded / total) * 100); // Calculate download progress percentage
        setProgress(percent); // Update progress
      }
    },
  });

  const blobData = await response.data; // Get the Blob data

  const file = new File([blobData], fileName, {
    type: blobData.type, // Assign the correct file type
  });

  setFile(file); // Set the file in the state
  setIsFileLoading(false); // Set loading state to false after file is ready
}
