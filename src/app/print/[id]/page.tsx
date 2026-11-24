import { redirect } from 'next/navigation';

interface PrintPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}

export default async function PrintPageRedirect({ params, searchParams }: PrintPageProps) {
  const { id } = await params;
  const { print } = await searchParams;
  const query = print ? `?print=${print}` : '';
  redirect(`/standalone/document/${id}${query}`);
}
