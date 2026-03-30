// 1. Add proper error boundaries
// app/error.tsx
"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}

// 2. Add global loading state
// app/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// 3. Add API response standardization
// lib/api-response.ts
export function successResponse(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400, code?: string) {
  return NextResponse.json({ 
    success: false, 
    error: { message, code } 
  }, { status });
}