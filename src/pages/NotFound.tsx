import { useEffect } from "react";

const STATIC_PAGES = ["/index.html", "/trio.html", "/carrinho.html", "/checkout.html", "/sobre.html"];

const NotFound = () => {
  useEffect(() => {
    const path = window.location.pathname;
    if (STATIC_PAGES.includes(path)) {
      // Force a full reload so the static HTML file is served instead of the SPA.
      window.location.assign(path + window.location.search + window.location.hash);
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF7F2", color: "#1A1208", fontFamily: "Lora, serif" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "3rem", marginBottom: "1rem" }}>404</h1>
        <p style={{ marginBottom: "1rem" }}>Página não encontrada</p>
        <a href="/index.html" style={{ color: "#3B2507" }}>Voltar ao início</a>
      </div>
    </div>
  );
};

export default NotFound;
