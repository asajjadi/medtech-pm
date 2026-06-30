// Tiny decoupled toast system. Call toast("Saved") anywhere; <Toaster/> renders it.
export function toast(message, kind = "success") {
  window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, kind } }));
}
