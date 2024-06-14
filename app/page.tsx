import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/poolmembers');
  return null;
}