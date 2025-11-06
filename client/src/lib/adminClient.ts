export async function adminRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const adminPassword = sessionStorage.getItem("admin_password");
  if (!adminPassword) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": adminPassword,
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res.json();
}

export async function adminQueryFn({ queryKey }: { queryKey: readonly string[] }): Promise<any> {
  const adminPassword = sessionStorage.getItem("admin_password");
  if (!adminPassword) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(queryKey.join("/") as string, {
    credentials: "include",
    headers: {
      "X-Admin-Token": adminPassword,
    },
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res.json();
}
