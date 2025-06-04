// Copies text to the clipboard and handles potential browser restrictions
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text); // Modern approach with Clipboard API
      return true;
    } catch (error: unknown) {
      console.error("Failed to copy:", error);
      return false;
    }
  } else {
    // Fallback for older browsers (Safari, etc.)
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "absolute";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      return successful;
    } catch (error: unknown) {
      console.error("Fallback: Oops, unable to copy", error);
      return false;
    } finally {
      document.body.removeChild(textArea); // Cleanup after copy attempt
    }
  }
}
