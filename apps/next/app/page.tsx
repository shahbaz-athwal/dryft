import { Dnd } from "@/components/dnd";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { data } = trpc.user.useQuery({ id: 1 });

  return (
    <div>
      <h1>{data?.name}</h1>
      <Dnd />
    </div>
  );
}
