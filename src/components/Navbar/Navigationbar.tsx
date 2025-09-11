// src/components/Navbar/Navigationbar.tsx  (SERVER COMPONENT)
import NavigationbarClient from "./Navigationbar-Client";
import { getAuthen } from "EduSmart/app/(auth)/action";

export default async function Navigationbar() {
  const isAuthed = await getAuthen(); // ✅ chạy ở server
  return <NavigationbarClient isAuthed={isAuthed} />;
}
