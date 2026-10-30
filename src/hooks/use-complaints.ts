import { useCallback, useEffect, useState } from "react";
import { loadComplaints, saveComplaints, type Complaint } from "@/lib/complaints";

export function useComplaints() {
  const [list, setList] = useState<Complaint[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setList(loadComplaints());
    setReady(true);
  }, []);

  const commit = useCallback((next: Complaint[]) => {
    const ok = saveComplaints(next);
    if (ok) setList(next);
    return ok;
  }, []);

  return { list, ready, commit };
}
