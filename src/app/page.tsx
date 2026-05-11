import Button from "@/components/Button/Button";
import Link from "next/link";


export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen" >
      <p>this is home page</p>
      <Link href="/login"><Button variant="primary" size="md">Login</Button></Link>
    </div>
  );
}
