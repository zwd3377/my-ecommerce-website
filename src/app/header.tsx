import Link from 'next/link';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Header() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const signOut = async () => {
    'use server';
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.signOut();
    return redirect('/');
  };

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
        <Link href="/" className="text-lg font-bold">我的商店</Link>
        <div className="flex items-center gap-4">
          <Link href="/cart" aria-label="View cart" className="p-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.763.746-1.858 1.705l-1.262 12.62A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.858-2.42l-1.262-12.62A1.875 1.875 0 0018.487 6.75H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              你好, {user.email}
              <form action={signOut}>
                <button className="py-2 px-4 rounded-md no-underline bg-red-500 text-white hover:bg-red-600">
                  退出
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="py-2 px-3 flex rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}