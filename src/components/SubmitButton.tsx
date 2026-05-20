'use client';

import { useFormStatus } from 'react-dom';

interface Props {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}

export default function SubmitButton({ children, pendingText = '处理中…', className }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        'w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 px-4 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed'
      }
    >
      {pending ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
