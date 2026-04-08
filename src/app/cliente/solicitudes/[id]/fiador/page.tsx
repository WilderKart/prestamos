import FiadorForm from "./FiadorForm";

export default async function FiadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FiadorForm solicitudId={id} />;
}
