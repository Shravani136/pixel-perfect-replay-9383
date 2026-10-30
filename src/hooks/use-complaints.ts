import { useCallback, useEffect, useState } from "react";
import { loadComplaints, saveComplaints, type Complaint, type SaveResult } from "@/lib/complaints";

export function useComplaints() {
  const [list, setList] = useState<Complaint[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setList(loadComplaints());
    setReady(true);
  }, []);

  const commit = useCallback((next: Complaint[]) => {
    const res: SaveResult = saveComplaints(next);
    if (res.ok) setList(next);
    return res;
  }, []);

  return { list, ready, commit };
}
