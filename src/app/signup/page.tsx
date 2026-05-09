import { headers, cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default function Signup({ searchParams }: { searchParams: { message: string } }) {
  const signUp = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // You can add additional user metadata here if needed
        // emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return redirect("/signup?message=Could not create user");
    }

    // Since we've disabled email confirmation, we can redirect the user directly
    // to the home page. They are now logged in.
    return redirect("/");
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <form
        className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
        action={signUp}
      >
        <label className="text-md" htmlFor="email">
          邮箱
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
          placeholder="you@example.com"
          required
        />
        <label className="text-md" htmlFor="password">
          密码
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        <button className="bg-green-700 rounded px-4 py-2 text-white mb-2">
          注册
        </button>
        {searchParams?.message && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  );
}
