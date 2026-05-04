import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    window.location.replace("/index.html");
  }, []);
  return null;
};

export default Index;
