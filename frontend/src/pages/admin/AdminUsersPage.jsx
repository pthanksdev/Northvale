import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../lib/api.js";
import { UsersIcon, ShieldCheckIcon, UserIcon } from "lucide-react";

function AdminUsersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => apiFetch("/api/admin/users"),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) =>
      apiFetch(`/api/admin/users/${id}/role`, { method: "PATCH", body: { role } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err) => {
      window.alert(err instanceof Error ? err.message : "Failed to update role");
    },
  });

  const users = data?.users ?? [];

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center gap-2">
        <UsersIcon className="size-7 text-primary" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold text-base-content">Users</h1>
          <p className="text-sm text-base-content/60">Manage user accounts and roles</p>
        </div>
      </div>

      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : (
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Verified</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-base-200 border border-base-300">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt=""
                              className="size-10 rounded-full object-cover"
                            />
                          ) : (
                            <UserIcon className="size-5 text-base-content/40" aria-hidden />
                          )}
                        </div>
                        <span className="font-medium">{user.displayName || "—"}</span>
                      </div>
                    </td>
                    <td className="text-sm">{user.email}</td>
                    <td>
                      {user.emailVerified ? (
                        <ShieldCheckIcon className="size-5 text-success" aria-label="Verified" />
                      ) : (
                        <span className="badge badge-ghost badge-xs">No</span>
                      )}
                    </td>
                    <td>
                      <select
                        className="select select-bordered select-xs"
                        value={user.role}
                        onChange={(e) =>
                          roleMutation.mutate({ id: user.id, role: e.target.value })
                        }
                        disabled={roleMutation.isPending}
                      >
                        <option value="customer">Customer</option>
                        <option value="support">Support</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="text-sm text-base-content/60">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-base-content/50 py-8">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUsersPage;
