import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/pools');
  return null;
}