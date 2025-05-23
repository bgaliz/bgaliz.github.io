import { Header } from "@/components/header/header.component";
import { HomePage } from "@/pages/Home/Home";

export default function Home() {
  return (
    <div 
      className="
        w-[100%]
        h-[100%]
        overflow-x-hidden]
      "
    >
      <Header />
      <HomePage />
    </div>
  );
}
